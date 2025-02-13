import { ObjectId } from 'mongoose';

export class GetUserQuery {
  constructor(public readonly userId: string | ObjectId) {}
}
