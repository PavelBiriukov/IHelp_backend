import { VolunteerInterface } from '../types/user.types';

export class UpdateVolunteerProfileCommand {
  constructor(public readonly userId: string, public readonly dto: Partial<VolunteerInterface>) {}
}
