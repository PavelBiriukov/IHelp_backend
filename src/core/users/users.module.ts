import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';

import { UsersRepositoryModule } from '../../datalake/users/users-repository.module';
import { HashModule } from '../../common/hash/hash.module';
import { HashService } from '../../common/hash/hash.service';
import { UsersService } from './users.service';
import { COMMANDS } from './commands-and-queries/commands';
// eslint-disable-next-line import/no-cycle
import { WebsocketApiModule } from '../../api/websocket-api/websocket-api.module';
// eslint-disable-next-line import/no-cycle
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    UsersRepositoryModule,
    HashModule,
    HttpModule,
    CqrsModule,
    forwardRef(() => WebsocketApiModule),
  ],
  providers: [...COMMANDS, UsersService, HashService],
  exports: [UsersService],
})
export class UsersModule {}
