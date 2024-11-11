import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TasksService } from './tasks.service';
import { TasksRepositoryModule } from '../../datalake/task/tasks-repository.module';
import { UsersRepositoryModule } from '../../datalake/users/users-repository.module';
import { CategoryRepositoryModule } from '../../datalake/category/category-repository.module';
import { UsersModule } from '../users/users.module';
import { COMMANDS } from './commands-and-queries/commands';
import { ChatsModule } from '../chat/chats.module';
import { ChatsRepositoryModule } from '../../datalake/chats/chats-repository.module';

@Module({
  imports: [
    TasksRepositoryModule,
    UsersRepositoryModule,
    CategoryRepositoryModule,
    UsersModule,
    CqrsModule,
    ChatsModule,
    ChatsRepositoryModule,
  ],
  providers: [...COMMANDS, TasksService],
  exports: [TasksService],
})
export class TasksModule {}
