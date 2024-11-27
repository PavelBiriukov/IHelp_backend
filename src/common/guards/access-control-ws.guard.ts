import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../types/user.types';
import { AccessRightsObject } from '../types/access-rights.types';
import { ACL_KEY, IS_PUBLIC_KEY } from '../constants/keys';

@Injectable()
export class AccessControlGuardWS implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const accessControl: AccessRightsObject = this.reflector.get<AccessRightsObject>(
      ACL_KEY,
      context.getHandler()
    );

    if (!accessControl) {
      return false;
    }

    const { handshake } = context.switchToWs().getClient();

    let user;

    try {
      user = await this.jwtService.verifyAsync(handshake.headers.authorization, {
        secret: this.configService.get<string>('jwt.key'),
      });
    } catch (error) {
      const {
        response: { statusText },
      } = error as AxiosError;
      throw new UnauthorizedException(statusText);
    }

    if (user.role === UserRole.ADMIN && user.isRoot) return true;
    if (accessControl.isRoot) {
      return (!!user.role && user.role === UserRole.ADMIN && user.isRoot) ?? false;
    }
    if (!!accessControl.role && accessControl.role !== UserRole.ADMIN) {
      return accessControl.role === user.role && accessControl.level <= user.status;
    }
    return (
      !!user.role &&
      user.role === UserRole.ADMIN &&
      !!user.permissions &&
      !!accessControl.rights &&
      accessControl.rights.every((grant) => user.permissions.includes(grant))
    );
  }
}
