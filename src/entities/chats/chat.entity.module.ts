import { Module } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from '../../datalake/chats/schemas/chat.schema';
import { TaskChat, TaskChatSchema } from '../../datalake/chats/schemas/task-chat.schema';
import { SystemChat, SystemChatSchema } from '../../datalake/chats/schemas/system-chat.schema';
import {
  ConflictChatWithVolunteer,
  ConflictChatWithVolunteerSchema,
} from '../../datalake/chats/schemas/conflict-volunteer-chat.schema';
import {
  ConflictChatWithRecipient,
  ConflictChatWithRecipientSchema,
} from '../../datalake/chats/schemas/conflict-recipient-chat.schema';
import { Message, MessagesSchema } from '../../datalake/messages/schemas/messages.schema';
import { ChatsFactory } from './chat.entity.factory';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Chat.name,
        schema: ChatSchema,
        discriminators: [
          { name: TaskChat.name, schema: TaskChatSchema },
          { name: SystemChat.name, schema: SystemChatSchema },
          { name: ConflictChatWithVolunteer.name, schema: ConflictChatWithVolunteerSchema },
          { name: ConflictChatWithRecipient.name, schema: ConflictChatWithRecipientSchema },
        ],
      } as ModelDefinition,
      { name: Message.name, schema: MessagesSchema },
    ]),
  ],
  providers: [ChatsFactory],
  exports: [ChatsFactory],
})
export class ChatEntityModule {}
