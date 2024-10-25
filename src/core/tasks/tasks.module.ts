import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TasksService } from './tasks.service';
import { TasksRepositoryModule } from '../../datalake/task/tasks-repository.module';
import { UsersRepositoryModule } from '../../datalake/users/users-repository.module';
import { CategoryRepositoryModule } from '../../datalake/category/category-repository.module';
import { UsersModule } from '../users/users.module';
import { CreateTaskChatHandler } from '../create-chat.handler';
import { ChatService } from '../chat/chats.service';
import { WebsocketApiModule } from '../../api/websocket-api/websocket-api.module';

@Module({
  imports: [
    TasksRepositoryModule,
    UsersRepositoryModule,
    CategoryRepositoryModule,
    UsersModule,
    CqrsModule,
    WebsocketApiModule,
  ],
  providers: [TasksService, CreateTaskChatHandler, ChatService],
  exports: [TasksService],
})
export class TasksModule {}
