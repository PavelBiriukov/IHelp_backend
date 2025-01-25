import { ObjectId, Types } from 'mongoose';

export function isObjectId(value: unknown): value is ObjectId {
  return (
    value instanceof Types.ObjectId ||
    (typeof value === 'object' &&
      value !== null &&
      'toHexString' in value &&
      typeof (value as { toHexString: () => string }).toHexString === 'function')
  );
}
