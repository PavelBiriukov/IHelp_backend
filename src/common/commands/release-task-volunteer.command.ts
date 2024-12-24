import { AnyUserInterface } from '../types/user.types';

export class ReleaseTaskVolunteerCommand {
  constructor(public readonly taskId: string, public readonly user: AnyUserInterface) {}
}
