import { VKLoginDtoInterface } from '../types/api.types';

export class LoginUserCommand {
  constructor(public readonly dto: VKLoginDtoInterface) {}
}
