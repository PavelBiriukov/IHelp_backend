import { CreateAdminDto } from '../dto/users.dto';

export class CreateAdminCommand {
  constructor(public readonly dto: CreateAdminDto) {}
}
