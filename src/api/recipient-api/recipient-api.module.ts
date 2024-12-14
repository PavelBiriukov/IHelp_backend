import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RecipientApiController } from './recipient-api.controller';
import { TasksModule } from '../../core/tasks/tasks.module';
import { TasksService } from '../../core/tasks/tasks.service';
import { TasksRepositoryModule } from '../../datalake/task/tasks-repository.module';
import { UsersRepositoryModule } from '../../datalake/users/users-repository.module';
import { CategoryRepositoryModule } from '../../datalake/category/category-repository.module';
import { UsersModule } from '../../core/users/users.module';
import { CategoriesModule } from '../../core/categories/categories.module';
import { QUERIES } from './commands-and-queries/queries';

@Module({
  imports: [
    TasksRepositoryModule,
    UsersRepositoryModule,
    CategoryRepositoryModule,
    TasksModule,
    UsersModule,
    CategoriesModule,
    CqrsModule,
  ],
  controllers: [RecipientApiController],
  providers: [...QUERIES, TasksService],
})
export class RecipientApiModule {}
