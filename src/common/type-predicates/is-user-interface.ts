import {
  AdminInterface,
  AnyUserInterface,
  RecipientInterface,
  UserRole,
  VolunteerInterface,
} from '../types/user.types';

export function isRecipientInterface(val: any): val is RecipientInterface {
  return !!val.role && val.role === UserRole.RECIPIENT && !!val.vkId && !!val._id;
}

export function isVolunteerInterface(val: any): val is VolunteerInterface {
  return !!val.role && val.role === UserRole.VOLUNTEER && !!val.vkId && !!val._id;
}

export function isAdminInterface(val: any): val is AdminInterface {
  return !!val.role && val.role === UserRole.ADMIN && !!val.login && !!val._id;
}

export function isAnyUserInterface(val: any): val is AnyUserInterface {
  return isVolunteerInterface(val) || isRecipientInterface(val) || isAdminInterface(val);
}
