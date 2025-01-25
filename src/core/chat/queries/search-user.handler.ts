import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchUserQuery } from './search-user.query';
import { UsersService } from '../../users/users.service';

@QueryHandler(SearchUserQuery)
export class SearchUserHandler implements IQueryHandler<SearchUserQuery> {
  constructor(private userService: UsersService) {}

  async execute(query: SearchUserQuery) {
    const userId = query;
    return this.userService.getProfile(userId.toString());
  }
}
