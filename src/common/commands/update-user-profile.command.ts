import { UserProfile } from '../types/user.types';

export class UpdateUserProfileCommand {
  constructor(public readonly userId: string, public readonly dto: Partial<UserProfile>) {}
}
