import { AnyUserInterface } from '../types/user.types';

export class SendTokenCommand {
  constructor(public readonly user: AnyUserInterface, public readonly token: string) {}
}
