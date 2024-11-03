import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogModule } from '../../core/blog/blog.module';
import { CategoriesModule } from '../../core/categories/categories.module';
import { TasksModule } from '../../core/tasks/tasks.module';
import { UsersModule } from '../../core/users/users.module';
import { ContactsModule } from '../../core/contacts/contacts.module';
import { PolicyModule } from '../../core/policy/policy.module';
import { AuthModule } from '../../core/auth/auth.module';
import { AuthService } from '../../core/auth/auth.service';
import { WebsocketApiGateway } from './websocket-api.gateway';
import { AddChatMessageHandler } from '../../core/add-chat-message.handler';
import { ChatService } from '../../core/chat/chats.service';
import { QUERIES } from '../../common/queries';

@Module({
  imports: [
    BlogModule,
    CategoriesModule,
    TasksModule,
    UsersModule,
    PolicyModule,
    ContactsModule,
    HttpModule,
    JwtModule,
    AuthModule,
    CqrsModule,
  ],
  providers: [
    WebsocketApiGateway,
    AuthService,
    JwtService,
    AddChatMessageHandler,
    ChatService,
    ...QUERIES,
  ],
})
export class WebsocketApiModule {}
