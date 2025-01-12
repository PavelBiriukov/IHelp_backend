import { ObjectId, Types } from 'mongoose';

export function isObjectId(value: unknown): value is ObjectId {
  return (
    value instanceof Types.ObjectId || // Первичная проверка
    (typeof value === 'object' && value !== null && typeof value.toHexString === 'function')
  );
}
