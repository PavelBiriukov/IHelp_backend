import { CreateUserDto } from '../dto/users.dto';

export class CreateUserCommand {
  constructor(public readonly dto: CreateUserDto) {}
}
