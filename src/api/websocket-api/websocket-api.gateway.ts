/* eslint-disable max-classes-per-file */
import { UnauthorizedException, UseGuards, UsePipes } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { AddChatMessageCommand } from '../../common/commands/add-chat-message.command';
// import { MessageInterface } from '../../common/types/chats.types';
import configuration from '../../config/configuration';
import { SocketAuthGuard } from '../../common/guards/socket-auth.guard';
import { SocketValidationPipe } from '../../common/pipes/socket-validation.pipe';
import { AnyUserInterface } from '../../common/types/user.types';
import { GetUserChatsMetaQuery } from '../../common/queries/get-user-chats-meta.query';
import {
  wsMetaPayload,
  wsMessageData,
  wsMessageKind,
  wsConnectedUserData,
  wsDisconnectionPayload,
  wsTokenPayload,
  // wsOpenedChatsData,
  wsChatPageQueryPayload,
} from '../../common/types/websockets.types';
import { NewMessageDto } from './dto/new-message.dto';
import { MessageInterface } from '../../common/types/chats.types';
import { GetChatMessagesQuery } from '../../common/queries/get-chat-messages.query';

// Интерфейс и dto созданы для тестирования SocketValidationPipe
// Удалить на этапе, когда будут реализованы необходимые dto
interface TestEventMessageInterface {
  string: string;
  object: object;
  array: Array<string>;
}
class TestEventMessageDto implements TestEventMessageInterface {
  @IsString()
  @IsNotEmpty()
  string: string;

  @IsObject()
  @IsNotEmpty()
  object: object;

  @IsArray()
  @IsNotEmpty()
  array: Array<string>;
}

@UseGuards(SocketAuthGuard)
@UsePipes(SocketValidationPipe)
@WebSocketGateway(configuration().server.ws_port, {
  cors: {
    allowedHeaders: '*',
  },
})
export class WebsocketApiGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @WebSocketServer()
  public server: Server;

  private connectedUsers: Map<string, wsConnectedUserData> = new Map();

  // private openedChats: Map<string, string[]> = new Map();

  private openedChats: Map<string, Set<string>> = new Map();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    // eslint-disable-next-line no-console
    console.log('SystemApi socket server was initialized');
  }

  /**
   * Хук, который срабатывает при подключении к сокету.
   * @param {Socket} client Данные о текущем подключившемся пользователе
   * @example http://localhost:3001
   * @headers {authorization} value Токен пользователя
   */
  // eslint-disable-next-line consistent-return
  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    const user = await this.checkUserAuth(client);
    // eslint-disable-next-line no-console
    console.log('user:', user);

    const connectedUser = this.getConnectedUser(user._id);
    if (connectedUser) {
      this.connectedUsers.set(user._id, { user, sockets: [...connectedUser.sockets, client.id] });
    } else {
      this.connectedUsers.set(user._id, { user, sockets: [client.id] });
    }

    // Отправляем мета-данные чатов подключившемуся пользователю
    await this.sendUserChatsMeta(user._id);
  }

  sendTokenAndUpdatedUser(user: AnyUserInterface, token: string) {
    const connectedUser = this.getConnectedUser(user._id);

    // если пользователь подключен, то отправляем токен на все устройства, с которых залогинен
    if (connectedUser) {
      connectedUser.sockets.forEach((clientId) => {
        this.server.sockets.sockets.get(clientId).emit(wsMessageKind.REFRESH_TOKEN_COMMAND, {
          data: {
            user,
            token,
          } as wsTokenPayload,
        } as wsMessageData);
      });

      // обновление объекта подключенного пользователя
      this.connectedUsers.set(user._id, { user, sockets: [...connectedUser.sockets] });
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const user = await this.checkUserAuth(client);

    const connectedUser = this.getConnectedUser(user._id);
    if (connectedUser) {
      const sockets = connectedUser.sockets.filter((socket) => socket !== client.id);
      if (sockets.length > 0) {
        this.connectedUsers.set(user._id, { user, sockets });
      } else {
        this.connectedUsers.delete(user._id);

        client.broadcast.emit(wsMessageKind.DISCONNECTION_EVENT, {
          data: {
            userId: user._id,
          } as wsDisconnectionPayload,
        } as wsMessageData);
      }
    }
  }

  private async checkUserAuth(client: Socket): Promise<AnyUserInterface | null> {
    let user: AnyUserInterface;
    try {
      user = await this.jwtService.verifyAsync(client.handshake.headers.authorization, {
        secret: this.configService.get<string>('jwt.key'),
      });
    } catch (error) {
      this.disconnect(client, { type: UnauthorizedException.name, message: error.message });
    }

    return user || null;
  }

  private getConnectedUser(userId: string): wsConnectedUserData | null {
    const connectedUser = this.connectedUsers.get(userId);
    return connectedUser || null;
  }

  private disconnect(socket: Socket, error: Record<string, unknown>) {
    socket.emit('error', new WsException(error));
    socket.disconnect();
  }

  private sendChatMessages(messages: Array<MessageInterface>, clientId: string) {
    const wsMessageData: wsMessageData = {
      data: {
        messages,
      },
    };

    this.server.sockets.sockets.get(clientId).emit(wsMessageKind.CHAT_PAGE_CONTENT, wsMessageData);
  }

  async sendUserChatsMeta(userId: string): Promise<void> {
    const connectedUser = this.getConnectedUser(userId);
    if (!connectedUser) return;

    const socketsToSend = connectedUser.sockets;

    const query = new GetUserChatsMetaQuery(userId);
    const userChatsMeta = await this.queryBus.execute<GetUserChatsMetaQuery, wsMetaPayload>(query);

    socketsToSend.forEach((clientId) => {
      this.server.sockets.sockets.get(clientId).emit(wsMessageKind.REFRESH_CHATS_META_COMMAND, {
        data: userChatsMeta as wsMetaPayload,
      } as wsMessageData);
    });
  }

  @SubscribeMessage('test_event')
  async handleTestEvent(@MessageBody('data') data: TestEventMessageDto) {
    // eslint-disable-next-line no-console
    console.log('This is test event data:', data);
  }

  @SubscribeMessage('NewMessage')
  async handleNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody('NewMessage') NewMessage: NewMessageDto
  ) {
    // *** ↓↓ временное решение до появления метода открытия чата ↓↓ ***
    const { chatId } = NewMessage;
    const userId = (await this.checkUserAuth(client))._id;
    const newarr = new Set<string>();
    if (chatId) {
      this.openedChats.set(chatId, newarr.add(userId));
    }
    // *** ↑↑ временное решение до появления метода открытия чата ↑↑ ***

    return this.commandBus.execute(new AddChatMessageCommand(NewMessage));
  }

  sendNewMessage(savedMessage: MessageInterface) {
    const { ...message } = savedMessage;
    const chatId = message.chatId as unknown as string;
    const usersInChat = this.openedChats.get(chatId);
    const connectedUsers: wsConnectedUserData[] = [];
    usersInChat.forEach((userInChat) => {
      connectedUsers.push(this.getConnectedUser(userInChat));
    });
    connectedUsers.forEach((connectedUser) => {
      connectedUser.sockets.forEach((clientId) => {
        this.server.sockets.sockets.get(clientId).emit('NewMessage', savedMessage);
      });
    });
  }

  @SubscribeMessage(wsMessageKind.CHAT_PAGE_QUERY)
  async handlePageQuery(
    @ConnectedSocket() client: Socket,
    @MessageBody('chatInfo') chatInfo: wsChatPageQueryPayload
  ) {
    const request: Array<MessageInterface> = await this.queryBus.execute(
      new GetChatMessagesQuery(chatInfo.chatId, chatInfo.skip, chatInfo.limit)
    );
    this.sendChatMessages(request, client.id);
  }

  @SubscribeMessage(wsMessageKind.OPEN_CHAT_EVENT)
  async handleOpenChat(@MessageBody('chatId') chatId: string, @ConnectedSocket() client: Socket) {
    const user = await this.checkUserAuth(client);
    const userId = user._id;

    if (!this.openedChats.has(chatId)) {
      this.openedChats.set(chatId, new Set());
    }

    this.openedChats.get(chatId).add(userId);
  }

  @SubscribeMessage(wsMessageKind.CLOSE_CHAT_EVENT)
  async handleCloseChat(@MessageBody('chatId') chatId: string, @ConnectedSocket() client: Socket) {
    const user = await this.checkUserAuth(client);
    const userId = user._id;

    const openedChat = this.openedChats.get(chatId);
    openedChat.delete(userId);

    if (openedChat.size === 0) {
      this.openedChats.delete(chatId);
    }
  }
}
