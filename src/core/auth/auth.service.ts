/* eslint-disable camelcase */
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { AxiosError, AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';

import { AnyUserInterface } from '../../common/types/user.types';
import { VKLoginDtoInterface, VKResponseInterface } from '../../common/types/api.types';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  // TODO: сократить payload, после создания метода логина админа сделать приватным
  public async authenticate(payload: AnyUserInterface): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.key'),
      expiresIn: this.configService.get<string>('jwt.ttl'),
    });
  }

  public async checkJWT(jwt: string) {
    return this.jwtService.verifyAsync(jwt, {
      secret: this.configService.get<string>('jwt.key'),
    });
  }

  public async loginVK(dto: VKLoginDtoInterface) {
    const { code, redirectUrl } = dto;
    const clientId = this.configService.get<string>('vk.appId');
    const clientSecret = this.configService.get<string>('vk.appSecret');
    const vkAuthUrl = `https://oauth.vk.com/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUrl}&code=${code}`;
    let vkId;
    let access_token: string;
    let email: string;
    try {
      const { data, status } = await this.httpService.axiosRef.get<
        VKResponseInterface,
        AxiosResponse<VKResponseInterface>
      >(vkAuthUrl);
      if (status === 200) {
        ({ user_id: vkId, access_token, email } = data);
      } else {
        throw new InternalServerErrorException(data.error_description);
      }
    } catch (err) {
      const {
        response: { status, statusText },
      } = err as AxiosError;
      switch (status) {
        case 401:
          throw new UnauthorizedException(statusText);
        default:
          throw new InternalServerErrorException({
            message: 'Произошла неизвестная ошибка при обращении на ВК',
          });
      }
    }
    const vkUserUrl = `https://api.vk.com/method/users.get?access_token=${access_token}&user_ids=${vkId}&fields=photo_max_orig,first_name,last_name,mobile_phone,email&v=5.81`; //= 5.131
    const {
      data: {
        response: [vkUser],
      },
    } = await this.httpService.axiosRef.get(vkUserUrl);
    const user = await this.usersService.checkVKCredential(String(vkId));
    if (user) {
      const token = await this.authenticate(user);
      const { _id } = user;
      UsersService.requiredLoginCompleted(_id);
      return { user, token };
    }
    // eslint-disable-next-line camelcase
    return { vkUser: { ...vkUser, email } };
  }
}
