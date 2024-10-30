import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { UsersService } from '../../core/users/users.service';
import { UsersModule } from '../../core/users/users.module';
import { HashModule } from '../../common/hash/hash.module';
import { UsersRepositoryModule } from '../../datalake/users/users-repository.module';
import { JwtStrategy } from '../../core/auth/strategies/jwt.strategy';
import { LocalStrategy } from '../../core/auth/strategies/local.strategy';
import { BlogModule } from '../../core/blog/blog.module';
import { CategoriesModule } from '../../core/categories/categories.module';
import { TasksModule } from '../../core/tasks/tasks.module';
import { ContactsModule } from '../../core/contacts/contacts.module';
import { AdminApiController } from './admin-api.controller';
import { COMMANDS } from './commands-and-queries/commands';

@Module({
  imports: [
    HashModule,
    UsersRepositoryModule,
    UsersModule,
    BlogModule,
    CategoriesModule,
    TasksModule,
    ContactsModule,
    CqrsModule,
  ],
  controllers: [AdminApiController],
  providers: [...COMMANDS, UsersService, JwtStrategy, LocalStrategy],
})
export class AdminApiModule {}
