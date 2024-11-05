import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';

import { UsersRepositoryModule } from '../../datalake/users/users-repository.module';
import { HashModule } from '../../common/hash/hash.module';
import { HashService } from '../../common/hash/hash.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';
import { COMMANDS } from './commands-and-queries/commands';
import { WebsocketApiGateway } from '../../api/websocket-api/websocket-api.gateway';

@Module({
  imports: [UsersRepositoryModule, HashModule, JwtModule, HttpModule, CqrsModule],
  providers: [...COMMANDS, UsersService, HashService, AuthService, WebsocketApiGateway],
  exports: [UsersService],
})
export class UsersModule {}
