import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';

// eslint-disable-next-line import/no-cycle
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    HttpModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secretOrPrivateKey: configService.get<string>('jwt.key'),
        signOptions: { expiresIn: configService.get<string>('jwt.ttl') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtService, JwtStrategy, LocalStrategy],
  exports: [AuthService, JwtService],
})
export class AuthModule {}
