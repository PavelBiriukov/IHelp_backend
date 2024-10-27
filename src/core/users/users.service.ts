import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common/exceptions';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { AuthenticateCommand } from '../../common/commands/authenticate.command';
import { SendTokenCommand } from '../../common/commands/send-token.command';
import { CreateAdminDto, CreateUserDto } from '../../common/dto/users.dto';
import {
  AdminInterface,
  VolunteerInterface,
  AdminPermission,
  UserProfile,
  UserRole,
  UserStatus,
  AnyUserInterface,
} from '../../common/types/user.types';
import { HashService } from '../../common/hash/hash.service';
import { POJOType } from '../../common/types/pojo.type';
import { PointGeoJSONInterface } from '../../common/types/point-geojson.types';
import { checkIsEnoughRights } from '../../common/helpers/checkIsEnoughRights';
import exceptions from '../../common/constants/exceptions';
import { UsersRepository } from '../../datalake/users/users.repository';
import { User } from '../../datalake/users/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  private static loginRequired: Array<string> = [];

  private async create(dto: {
    address: string;
    role: UserRole;
    isRoot?: boolean;
    keys?: boolean;
    vkId: string;
    avatar?: string;
    login?: string;
    isActive?: boolean;
    score?: number;
    password?: string;
    phone: string;
    permissions?: Array<AdminPermission>;
    name: string;
    location?: PointGeoJSONInterface;
    status?: UserStatus;
  }) {
    const {
      permissions,
      _id,
      vkId,
      role,
      avatar,
      address,
      isRoot,
      isActive,
      name,
      phone,
      login,
      createdAt,
      updatedAt,
      status,
      location,
    } = await this.usersRepo.create(dto);
    return Promise.resolve({
      permissions,
      _id,
      vkId,
      role,
      avatar,
      address,
      isRoot,
      isActive,
      name,
      phone,
      login,
      createdAt,
      updatedAt,
      status,
      location,
    } as Record<string, unknown>);
  }

  async checkVKCredential(vkId: string): Promise<POJOType<User>> | null {
    return this.usersRepo.findOne({
      vkId,
      role: { $in: [UserRole.VOLUNTEER, UserRole.RECIPIENT] },
    });
  }

  async checkAdminCredentials(login: string, password: string): Promise<AdminInterface> | null {
    const user = await this.usersRepo.findOne(
      {
        role: UserRole.ADMIN,
        login,
      },
      {
        password: true,
        permissions: true,
        login: true,
        vkId: true,
        isRoot: true,
        role: true,
        address: true,
        avatar: true,
        phone: true,
        name: true,
        isActive: true,
      }
    );
    if (!user) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }
    const { password: passDb, ...data } = user as AdminInterface;
    const isOk = await HashService.compareHash(password, passDb);
    return isOk ? Promise.resolve(data as AdminInterface) : null;
  }

  async createUser(dto: CreateUserDto) {
    let extras: Partial<CreateUserDto> = {};
    if (dto.role === UserRole.ADMIN) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: 'createUser() не создаёт администратора',
      });
    }
    if (dto.role === UserRole.VOLUNTEER) {
      extras = { keys: false, score: 0 };
    }
    return this.create({
      status: UserStatus.UNCONFIRMED,
      ...dto,
      ...extras,
    });
  }

  async createAdmin(dto: CreateAdminDto) {
    /*    if (dto.role !== UserRole.ADMIN) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: 'createAdmin() создаёт только администратора',
      });
    } */
    return this.create({
      ...dto,
      password: await this.hashPassword(dto.password),
      isRoot: false,
      isActive: true,
      role: UserRole.ADMIN,
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const newPassword = await HashService.generateHash(password);
    return newPassword;
  }

  async setAdminPassword(userId: string, password: string): Promise<AnyUserInterface> {
    const hash = await this.hashPassword(password);
    const admin = (await this.usersRepo.findOneAndUpdate(
      { _id: userId, role: UserRole.ADMIN },
      { password: hash },
      { new: true }
    )) as User & AnyUserInterface;
    if (!admin) {
      throw new NotFoundException(`Пользователь с _id '${userId}' не найден<`);
    }
    if (admin.isRoot && admin.role === UserRole.ADMIN) {
      throw new ForbiddenException(`Изменение пароля Главного администратора недоступно`);
    }
    this.refreshAndSendToken(admin);
    return admin;
  }

  async confirm(_id: string): Promise<User & AnyUserInterface> {
    const user = (await this.usersRepo.findById(_id)) as User & AnyUserInterface;
    if (!user) {
      throw new NotFoundException(`Пользователь с _id '${_id}' не найден<`);
    }
    if (user.role === UserRole.VOLUNTEER || user.role === UserRole.RECIPIENT) {
      const { status } = user;
      switch (status) {
        case UserStatus.BLOCKED: {
          throw new ForbiddenException(
            `Пользователь с _id '${_id}' заблокирован. Сначала надо снять блокировку.`
          );
        }
        case UserStatus.UNCONFIRMED: {
          const { role } = user;
          const updatedUser = (await this.usersRepo.findOneAndUpdate(
            { _id, role },
            { status: UserStatus.CONFIRMED }
          )) as User & AnyUserInterface;

          this.refreshAndSendToken(updatedUser);

          return Promise.resolve(updatedUser);
        }
        case UserStatus.CONFIRMED: {
          return user;
        }
        case UserStatus.ACTIVATED:
        case UserStatus.VERIFIED: {
          throw new ConflictException(
            `Пользователь c _id '${_id}' уже обладает более высоким статусом!`
          );
        }
        default: {
          throw new InternalServerErrorException('Внутренняя ошибка сервера', {
            cause: `Некорректный статус пользователя с _id '${_id}' `,
          });
        }
      }
    }
    throw new BadRequestException('Повысить можно только волонтёра или реципиента');
  }

  async upgrade(_id: string): Promise<User & AnyUserInterface> {
    const user = (await this.usersRepo.findById(_id)) as User & AnyUserInterface;
    if (!user) {
      throw new NotFoundException(`Пользователь с _id '${_id}' не найден<`);
    }
    if (user.role === UserRole.VOLUNTEER || user.role === UserRole.RECIPIENT) {
      const { status } = user;
      if (status < UserStatus.ACTIVATED) {
        const { role } = user;
        const updatedUser = (await this.usersRepo.findOneAndUpdate(
          { _id, role },
          { status: status + 1 }
        )) as User & AnyUserInterface;

        this.refreshAndSendToken(updatedUser);

        return Promise.resolve(updatedUser);
      }
      return user;
    }
    throw new BadRequestException('Повысить можно только волонтёра или реципиента');
  }

  async downgrade(_id: string): Promise<User & AnyUserInterface> {
    const user = (await this.usersRepo.findById(_id)) as User & AnyUserInterface;
    if (!user) {
      throw new NotFoundException(`Пользователь с _id '${_id}' не найден<`);
    }
    if (user.role === UserRole.VOLUNTEER || user.role === UserRole.RECIPIENT) {
      const { status } = user;
      if (status > UserStatus.UNCONFIRMED && status <= UserStatus.ACTIVATED) {
        const { role } = user;
        const updatedUser = (await this.usersRepo.findOneAndUpdate(
          { _id, role },
          { status: status - 1 }
        )) as User & AnyUserInterface;

        this.refreshAndSendToken(updatedUser);

        return Promise.resolve(updatedUser);
      }
      return user;
    }
    throw new BadRequestException('Понизить статус можно только волонтёру или реципиенту');
  }

  async grantKeys(_id: string): Promise<User & AnyUserInterface> {
    const user = (await this.usersRepo.findById(_id)) as User & AnyUserInterface;
    if (!user) {
      throw new NotFoundException(`Пользователь с _id '${_id}' не найден<`);
    }
    if (user.role === UserRole.VOLUNTEER) {
      const { role } = user;
      const updatedUser = (await this.usersRepo.findOneAndUpdate(
        { _id, role },
        { keys: true }
      )) as User & AnyUserInterface;

      this.refreshAndSendToken(updatedUser);

      return Promise.resolve(updatedUser);
    }

    throw new BadRequestException('Выдать ключи можно только волонтёру!');
  }

  async revokeKeys(_id: string): Promise<User & AnyUserInterface> {
    const user = (await this.usersRepo.findById(_id)) as User & AnyUserInterface;
    if (!user) {
      throw new NotFoundException(`Пользователь с _id '${_id}' не найден<`);
    }
    if (user.role === UserRole.VOLUNTEER) {
      const { role } = user;
      const updatedUser = (await this.usersRepo.findOneAndUpdate(
        { _id, role },
        { keys: false }
      )) as User & AnyUserInterface;

      this.refreshAndSendToken(updatedUser);

      return Promise.resolve(updatedUser);
    }

    throw new BadRequestException('Отобрать ключи можно только у волонтёра!');
  }

  async activate(_id: string): Promise<User & AnyUserInterface> {
    const user = (await this.usersRepo.findById(_id)) as User & AnyUserInterface;
    if (!user) {
      throw new NotFoundException(`Пользователь с _id '${_id}' не найден!`);
    }
    if (user.role === UserRole.ADMIN) {
      const updatedUser = (await this.usersRepo.findOneAndUpdate(
        { _id, role: UserRole.ADMIN },
        { isActive: true }
      )) as User & AnyUserInterface;

      this.refreshAndSendToken(updatedUser);

      return Promise.resolve(updatedUser);
    }
    throw new BadRequestException('Можно активировать только администратора');
  }

  async block(_id: string) {
    const user = (await this.usersRepo.findById(_id)) as User & AnyUserInterface;
    if (!user) {
      throw new NotFoundException(`Пользователь с _id '${_id}' не найден!`);
    }
    if (user.role === UserRole.VOLUNTEER || user.role === UserRole.RECIPIENT) {
      const { role } = user;
      UsersService.requireLogin(_id);
      return this.usersRepo.findOneAndUpdate({ _id, role }, { status: UserStatus.BLOCKED });
    }
    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Нужен _id волонтёра или реципиента!');
    }

    throw new InternalServerErrorException('Внутренняя ошибка сервера', {
      cause: `Некорректная роль пользователя с _id '${_id}' `,
    });
  }

  async deactivate(_id: string) {
    const user = (await this.usersRepo.findById(_id)) as User & AnyUserInterface;
    if (!user) {
      throw new NotFoundException(`Пользователь с _id '${_id}' не найден!`);
    }
    if (user.role === UserRole.ADMIN) {
      UsersService.requireLogin(_id);
      return this.usersRepo.findOneAndUpdate({ _id, role: UserRole.ADMIN }, { isActive: false });
    }
    if (user.role === UserRole.VOLUNTEER || user.role === UserRole.RECIPIENT) {
      throw new BadRequestException('Нужен _id администратора!');
    }

    throw new InternalServerErrorException('Внутренняя ошибка сервера', {
      cause: `Некорректная роль пользователя с _id '${_id}' `,
    });
  }

  // Добавление привилегий администратору. Только root
  public async grantPrivileges(
    admin: AnyUserInterface,
    userId: string,
    privileges: Array<AdminPermission>
  ): Promise<User & AnyUserInterface> {
    if (!checkIsEnoughRights(admin, [], true)) {
      throw new ForbiddenException(exceptions.users.onlyForAdmins);
    }

    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден!', {
        cause: `Пользователь с _id '${userId}' не найден`,
      });
    }
    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Пользователь должен быть администратором', {
        cause: `Попытка дать права  ${privileges} пользователю с _id '${userId}' и ролью '${user.role}'`,
      });
    }

    const updatedUser = (await this.usersRepo.findOneAndUpdate(
      { _id: userId, role: UserRole.ADMIN },
      { $addToSet: { permissions: { $each: privileges } } }
    )) as User & AnyUserInterface;

    this.refreshAndSendToken(updatedUser);

    return Promise.resolve(updatedUser);
  }

  // Удаление привилегий администратора. Только root
  public async revokePrivileges(
    admin: AnyUserInterface,
    userId: string,
    privileges: Array<AdminPermission>
  ): Promise<User & AnyUserInterface> {
    if (!checkIsEnoughRights(admin, [], true)) {
      throw new ForbiddenException(exceptions.users.onlyForAdmins);
    }

    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден!', {
        cause: `Пользователь с _id '${userId}' не найден`,
      });
    }
    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Пользователь должен быть администратором', {
        cause: `Попытка дать права  ${privileges} пользователю с _id '${userId}' и ролью '${user.role}'`,
      });
    }

    const updatedUser = (await this.usersRepo.findOneAndUpdate(
      { _id: userId, role: UserRole.ADMIN },
      { $pull: { permissions: { $in: privileges } } }
    )) as User & AnyUserInterface;

    this.refreshAndSendToken(updatedUser);

    return Promise.resolve(updatedUser);
  }

  // Обновление привилегий администратора. Только root
  public async updatePrivileges(
    admin: AnyUserInterface,
    userId: string,
    privileges: Array<AdminPermission>
  ): Promise<User & AnyUserInterface> {
    if (!checkIsEnoughRights(admin, [], true)) {
      throw new ForbiddenException(exceptions.users.onlyForAdmins);
    }

    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден!', {
        cause: `Пользователь с _id '${userId}' не найден`,
      });
    }
    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Пользователь должен быть администратором', {
        cause: `Попытка дать права  ${privileges} пользователю с _id '${userId}' и ролью '${user.role}'`,
      });
    }

    const updatedUser = (await this.usersRepo.findOneAndUpdate(
      { _id: userId, role: UserRole.ADMIN },
      { $set: { permissions: privileges } }
    )) as User & AnyUserInterface;

    this.refreshAndSendToken(updatedUser);

    return Promise.resolve(updatedUser);
  }

  public async getUsersByRole(role: UserRole) {
    return this.usersRepo.find({
      status: { $ne: UserStatus.UNCONFIRMED },
      role,
    });
  }

  public async getUnconfirmedUsers() {
    return this.usersRepo.find({
      status: UserStatus.UNCONFIRMED,
    });
  }

  public async getAdministrators() {
    return this.usersRepo.find({ role: UserRole.ADMIN, isRoot: false, isActive: true });
  }

  public async getProfile(userId: string) {
    try {
      const user = await this.usersRepo.findOne({ _id: userId });

      if (!user) {
        throw new NotFoundException('Пользователь не найден!', {
          cause: `Пользователь с _id '${userId}' не найден`,
        });
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при выполнении запроса!', {
        cause: error.message,
      });
    }
  }

  public async updateProfile(
    userId: string,
    dto: Partial<UserProfile>
  ): Promise<User & AnyUserInterface> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден!', {
        cause: `Пользователь с _id '${userId}' не найден`,
      });
    }
    const { role } = user;
    const updatedUser = (await this.usersRepo.findOneAndUpdate(
      { _id: userId, role },
      dto
    )) as User & AnyUserInterface;

    this.refreshAndSendToken(updatedUser);

    return Promise.resolve(updatedUser);
  }

  public async updateVolunteerProfile(
    userId: string,
    dto: Partial<VolunteerInterface>
  ): Promise<User & AnyUserInterface> {
    const updatedUser = (await this.usersRepo.findOneAndUpdate(
      { _id: userId, role: UserRole.VOLUNTEER },
      dto
    )) as User & AnyUserInterface;

    this.refreshAndSendToken(updatedUser);

    return Promise.resolve(updatedUser);
  }

  private async refreshAndSendToken(user: AnyUserInterface) {
    if (user) {
      const token: string = await this.commandBus.execute<AuthenticateCommand, string>(
        new AuthenticateCommand(user)
      );
      this.commandBus.execute<SendTokenCommand, string>(new SendTokenCommand(user, token));
    }
  }

  private static requireLogin(userId: string) {
    UsersService.loginRequired = [...UsersService.loginRequired, userId];
  }

  public static isLoginRequired(userId: string) {
    return UsersService.loginRequired.includes(userId);
  }

  public static requiredLoginCompleted(userId: string) {
    if (UsersService.isLoginRequired(userId)) {
      UsersService.loginRequired = UsersService.loginRequired.filter((id) => id !== userId);
    }
  }
}
