import { type ObjectId } from 'mongoose';

export function ensureStringId(id: string | ObjectId): string {
  return typeof id === 'string' ? id : id.toString();
}
