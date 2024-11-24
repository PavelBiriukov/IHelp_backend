import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthApiController } from './auth-api.controller';
import { AuthModule } from '../../core/auth/auth.module';
import { UsersModule } from '../../core/users/users.module';
import { UsersRepositoryModule } from '../../datalake/users/users-repository.module';
import { HashModule } from '../../common/hash/hash.module';
import { HashService } from '../../common/hash/hash.service';
import { COMMANDS } from './commands-and-queries/commands';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    HttpModule,
    JwtModule,
    UsersRepositoryModule,
    HashModule,
    CqrsModule,
  ],
  controllers: [AuthApiController],
  providers: [...COMMANDS, HashService],
})
export class AuthApiModule {}
