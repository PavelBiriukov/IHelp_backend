import { AdminPermission, AnyUserInterface } from '../types/user.types';

export class RevokeAdminPrivilegesCommand {
  constructor(
    public readonly admin: AnyUserInterface,
    public readonly userId: string,
    public readonly privileges: Array<AdminPermission>
  ) {}
}
