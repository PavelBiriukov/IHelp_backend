import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CategoryRepositoryModule } from '../../datalake/category/category-repository.module';
import { CategoriesService } from './categories.service';
import { TasksModule } from '../tasks/tasks.module';
import { COMMANDS } from './commands-and-queries/commands';

@Module({
  imports: [CategoryRepositoryModule, TasksModule, CqrsModule],
  providers: [...COMMANDS, CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
