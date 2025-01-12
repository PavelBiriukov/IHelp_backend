import { type ObjectId } from 'mongoose';

export function ensureStringId(id: string | ObjectId): string {
  if (typeof id === 'string') {
    return id;
  }
  return id.toString();
}
