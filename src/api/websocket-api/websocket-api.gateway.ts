/* eslint-disable max-classes-per-file */
import { UnauthorizedException, UseGuards, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { ObjectId } from 'mongoose';
import { AddChatMessageCommand } from '../../common/commands/add-chat-message.command';
import configuration from '../../config/configuration';
import { SocketValidationPipe } from '../../common/pipes/socket-validation.pipe';
import { AnyUserInterface } from '../../common/types/user.types';
import { GetUserChatsMetaQuery } from '../../common/queries/get-user-chats-meta.query';
import {
  wsMessageKind,
  wsChatPageQueryPayload,
  wsMetaPayload,
} from '../../common/types/websockets.types';
import { NewMessageDto } from './dto/new-message.dto';
import { AnyUserChatsResponseDtoInterface, MessageInterface } from '../../common/types/chats.types';
import { GetChatMessagesQuery } from '../../common/queries/get-chat-messages.query';
import { AuthService } from '../../core/auth/auth.service';
import { SocketAuthGuard } from '../../common/guards/socket-auth.guard';
import { ensureStringId } from '../../common/helpers/ensure-string-id';

/*
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
*/

@UseGuards(SocketAuthGuard)
@UsePipes(SocketValidationPipe)
@WebSocketGateway(configuration().server.ws_port, {
  cors: {
    allowedHeaders: '*',
  },
})
export class WebsocketApiGateway implements OnGatewayInit, OnGatewayConnection {
  constructor(
    private readonly authService: AuthService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @WebSocketServer()
  public server: Server;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    // eslint-disable-next-line no-console
    console.log('SystemApi socket server was initialized.\nOprions:');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    await this.checkUserAuth(client);

    const { user = null } = client.data;

    if (!user) {
      return;
    }

    client.join(ensureStringId(user._id));

    const userChatsMeta = await this.queryBus.execute(new GetUserChatsMetaQuery(user._id));

    this.server.in(ensureStringId(user._id)).emit(wsMessageKind.INITIAL_CHATS_META_COMMAND, {
      data: userChatsMeta,
    });
  }

  async sendTokenAndUpdatedUser(user: AnyUserInterface, token: string) {
    const { userRoom, hasOnlineUser } = await this.getUserRoomData(ensureStringId(user._id));

    if (hasOnlineUser) {
      userRoom.emit(wsMessageKind.REFRESH_TOKEN_COMMAND, {
        data: {
          user,
          token,
        },
      });
    }
  }

  private async getUserRoomData(userId: string) {
    try {
      const userRoom = this.server.in(userId);
      const userSocket = await userRoom.fetchSockets();

      return { userRoom, hasOnlineUser: userSocket.length >= 1 };
    } catch (e) {
      return { userRoom: null, hasOnlineUser: false };
    }
  }

  private async checkUserAuth(client: Socket) {
    try {
      const token = client.handshake.headers.authorization as string;
      if (!token) {
        throw new UnauthorizedException('Token not provided');
      }

      const user = await this.authService.checkJWT(token);

      // eslint-disable-next-line no-param-reassign
      client.data.user = user;
    } catch (error) {
      this.disconnect(client, { type: UnauthorizedException.name, message: error.message });
    }
  }

  private disconnect(socket: Socket, error: Record<string, unknown>) {
    socket.emit('error', new WsException(error));
    socket.disconnect();
  }

  async sendChatMeta(userIds: string[], meta: AnyUserChatsResponseDtoInterface) {
    const userRoomData = await Promise.allSettled(
      userIds.map((userId) => this.getUserRoomData(userId))
    );

    userRoomData.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { userRoom, hasOnlineUser } = result.value;

        if (hasOnlineUser) {
          userRoom.emit(wsMessageKind.NEW_CHATS_META_COMMAND, {
            data: meta,
          });
        }
      }
    });
  }

  @SubscribeMessage(wsMessageKind.OPEN_CHAT_EVENT)
  async handleOpenChat(@MessageBody('data') chatId: string, @ConnectedSocket() client: Socket) {
    client.join(chatId);
  }

  @SubscribeMessage(wsMessageKind.NEW_MESSAGE_COMMAND)
  async handleNewMessage(@MessageBody('data') newMessage: NewMessageDto) {
    return this.commandBus.execute(new AddChatMessageCommand(newMessage));
  }

  sendNewMessage(savedMessage: MessageInterface) {
    this.server.in(ensureStringId(savedMessage.chatId)).emit(wsMessageKind.NEW_MESSAGE_COMMAND, {
      data: savedMessage,
    });
  }

  sendFreshMeta(userId: string | ObjectId, meta: wsMetaPayload) {
    this.server.in(ensureStringId(userId)).emit(wsMessageKind.REFRESH_CHATS_META_COMMAND, {
      data: meta,
    });
  }

  @SubscribeMessage(wsMessageKind.CHAT_PAGE_QUERY)
  async handlePageQuery(
    @ConnectedSocket() client: Socket,
    @MessageBody('data') chatInfo: wsChatPageQueryPayload
  ) {
    const messages = await this.queryBus.execute(
      new GetChatMessagesQuery(chatInfo.chatId, chatInfo.skip, chatInfo.limit)
    );

    const { user = null } = client.data;

    const { userRoom } = await this.getUserRoomData(ensureStringId(user._id));

    userRoom.emit(wsMessageKind.CHAT_PAGE_CONTENT, {
      data: {
        messages,
      },
    });
  }

  @SubscribeMessage(wsMessageKind.CLOSE_CHAT_EVENT)
  async handleCloseChat(@ConnectedSocket() client: Socket, @MessageBody('data') chatId: string) {
    client.leave(chatId);
  }
}
