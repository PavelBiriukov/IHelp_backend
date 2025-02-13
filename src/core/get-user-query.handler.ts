import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from '../common/queries/get-user.query';
import { UsersService } from './users/users.service';

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly usersService: UsersService) {}

  async execute(dto: GetUserQuery) {
    const { userId } = dto;
    return this.usersService.getUserById(userId);
  }
}
