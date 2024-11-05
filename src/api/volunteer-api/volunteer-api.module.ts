import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TasksModule } from '../../core/tasks/tasks.module';
import { TasksService } from '../../core/tasks/tasks.service';
import { TasksRepositoryModule } from '../../datalake/task/tasks-repository.module';
import { UsersRepositoryModule } from '../../datalake/users/users-repository.module';
import { CategoryRepositoryModule } from '../../datalake/category/category-repository.module';
import { UsersModule } from '../../core/users/users.module';
import { CategoriesModule } from '../../core/categories/categories.module';
import { VolunteerApiController } from './volunteer-api.controller';

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
  controllers: [VolunteerApiController],
  providers: [TasksService],
})
export class VolunteerApiModule {}
