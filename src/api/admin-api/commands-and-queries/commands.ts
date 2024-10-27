import { GrantVolunteerKeysHandler } from '../../../core/grant-volunteer-kyes.handler';
import { ActivateUserHandler } from '../../../core/activate-user.handler';
import { ConfirmUserHandler } from '../../../core/confirm-user.handler';
import { UpgradeUserHandler } from '../../../core/upgrade-user.handler';
import { GrantAdminPrivilegesHandler } from '../../../core/grant-admin-privileges.handler';
import { RevokeAdminPrivilegesHandler } from '../../../core/revoke-admin-privileges.handler';
import { UpdateAdminPrivilegesHandler } from '../../../core/update-admin-privileges.handler copy';

export const COMMANDS = [
  ConfirmUserHandler,
  ActivateUserHandler,
  UpgradeUserHandler,
  GrantVolunteerKeysHandler,
  GrantAdminPrivilegesHandler,
  RevokeAdminPrivilegesHandler,
  UpdateAdminPrivilegesHandler,
];
