import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TasksService } from './tasks.service';
import { TasksRepositoryModule } from '../../datalake/task/tasks-repository.module';
import { UsersRepositoryModule } from '../../datalake/users/users-repository.module';
import { CategoryRepositoryModule } from '../../datalake/category/category-repository.module';
import { UsersModule } from '../users/users.module';
import { COMMANDS } from './commands-and-queries/commands';
import { WebsocketApiModule } from '../../api/websocket-api/websocket-api.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TasksRepositoryModule,
    UsersRepositoryModule,
    CategoryRepositoryModule,
    UsersModule,
    CqrsModule,
    WebsocketApiModule,
    ChatModule,
  ],
  providers: [...COMMANDS, TasksService],
  exports: [TasksService],
})
export class TasksModule {}
