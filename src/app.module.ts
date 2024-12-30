import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';

import configuration from './config/configuration';
import { HashModule } from './common/hash/hash.module';
import { UsersRepositoryModule } from './datalake/users/users-repository.module';
import { CategoryRepositoryModule } from './datalake/category/category-repository.module';
import { TasksRepositoryModule } from './datalake/task/tasks-repository.module';
import { PolicyRepositoryModule } from './datalake/confidentiality-policy/policy-repository.module';
import { AuthApiModule } from './api/auth-api/auth-api.module';
import { AuthModule } from './core/auth/auth.module';
import { UsersModule } from './core/users/users.module';
import { MongooseConfigService } from './config/database-config.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { CategoriesModule } from './core/categories/categories.module';
import { AdminApiModule } from './api/admin-api/admin-api.module';
import { RecipientApiModule } from './api/recipient-api/recipient-api.module';
import { VolunteerApiModule } from './api/volunteer-api/volunteer-api.module';
import { BlogModule } from './core/blog/blog.module';
import { ContactsRepositoryModule } from './datalake/contacts/contacts-repository.module';
import { ContactsModule } from './core/contacts/contacts.module';
import { TasksModule } from './core/tasks/tasks.module';
import { PolicyModule } from './core/policy/policy.module';
import { SystemApiModule } from './api/system-api/system-api.module';
import { LoggerMiddleware } from './common/middleware';
import { WebsocketApiModule } from './api/websocket-api/websocket-api.module';
import { ChatEntityModule } from './entities/chats/chat.entity.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: MongooseConfigService,
    }),
    HashModule,
    // ScheduleModule.forRoot(),
    TasksRepositoryModule,
    UsersRepositoryModule,
    PolicyRepositoryModule,
    AuthApiModule,
    AuthModule,
    UsersModule,
    CategoryRepositoryModule,
    CategoriesModule,
    AdminApiModule,
    RecipientApiModule,
    VolunteerApiModule,
    BlogModule,
    ContactsRepositoryModule,
    ContactsModule,
    TasksModule,
    PolicyModule,
    SystemApiModule,
    WebsocketApiModule,
    ChatEntityModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
