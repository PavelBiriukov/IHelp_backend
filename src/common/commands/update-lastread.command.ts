import { wsLastreadPayload } from '../types/websockets.types';
import { AnyUserInterface } from '../types/user.types';

export class UpdateLastreadCommand {
  constructor(public readonly dto: wsLastreadPayload, public readonly user: AnyUserInterface) {}
}
