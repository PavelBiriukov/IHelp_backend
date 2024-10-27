import { AdminPermission, AnyUserInterface } from '../types/user.types';

export class UpdateAdminPrivilegesCommand {
  constructor(
    public readonly admin: AnyUserInterface,
    public readonly userId: string,
    public readonly privileges: Array<AdminPermission>
  ) {}
}
