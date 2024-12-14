import { AnyUserInterface } from '../types/user.types';

export class AuthenticateCommand {
  constructor(public readonly dto: AnyUserInterface) {}
}
