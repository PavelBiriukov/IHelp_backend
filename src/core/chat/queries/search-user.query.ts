import { ObjectId } from 'mongoose';

export class SearchUserQuery {
  constructor(public readonly userId: ObjectId) {}
}
