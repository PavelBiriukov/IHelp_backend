import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MethodNotAllowedException } from '@nestjs/common/exceptions';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { SetAdminPasswordCommand } from '../../common/commands-and-queries/set-admin-password.command';
import { UsersService } from '../../core/users/users.service';
import { BlogService } from '../../core/blog/blog.service';
import { CategoriesService } from '../../core/categories/categories.service';
import { ContactsService } from '../../core/contacts/contacts.service';
import { TasksService } from '../../core/tasks/tasks.service';
import { AccessControlGuard } from '../../common/guards/access-control.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AccessControlList } from '../../common/decorators/access-control-list.decorator';
import { AnyUserInterface, UserRole } from '../../common/types/user.types';
import { AccessRights } from '../../common/types/access-rights.types';
import { ResolveResult, TaskInterface, TaskStatus } from '../../common/types/task.types';
import { UpdateContactsRequestDto } from '../../common/dto/contacts.dto';
import { NewAdminDto } from './dto/new-admin.dto';
import { CreatedAdminDto } from './dto/created-admin.dto';
import { PostDTO } from './dto/new-post.dto';
import { ApiPrivilegesDto } from './dto/privileges.dto';
import { ApiCreateCategoryDto } from './dto/new-category.dto';
import { ApiUpdateCategoryDto } from './dto/update-category.dto';
import { ApiBulkUpdateCategoriesDto } from './dto/bulk-update-categories.dto';
import { UserDto } from './dto/user.dto';
import { CreatedPostDto } from './dto/created-post.dto';
import { CreatedCategoryDto } from './dto/created-category.dto';
import { ProcessedTaskDto } from './dto/processed-task.dto';
import { ContactInfoDto } from './dto/contact.dto';
import { BadRequestErrorResponseDto } from './dto/bad-request-error.dto';
import { UnauthorizedErrorResponseDto } from './dto/unauthorized-request-error.dto';
import { UpdatedAdminDto } from './dto/updated-admin.dto';
import { UpdatedContactsDto } from './dto/updated-contact.dto';
import { SetAdminPasswordDto } from './dto/set-admin-password.dto';
import { ConfirmUserCommand } from '../../common/commands-and-queries/confirm-user.command';
import { ActivateUserCommand } from '../../common/commands-and-queries/activate-user.command';
import { UpgradeUserCommand } from '../../common/commands-and-queries/upgrade-user.command';
import { GrantVolunteerKeysCommand } from '../../common/commands-and-queries/grant-volunteer-keys.command';
import { GrantAdminPrivilegesCommand } from '../../common/commands-and-queries/grant-admin-privileges.command';
import { RevokeAdminPrivilegesCommand } from '../../common/commands-and-queries/revoke-admin-privileges.command';
import { UpdateAdminPrivilegesCommand } from '../../common/commands-and-queries/update-admin-privileges.command copy';
import { DeactivateAdminCommand } from '../../common/commands-and-queries/deactivate-admin.command';
import { BlockUserCommand } from '../../common/commands-and-queries/block-user.command';

@UseGuards(JwtAuthGuard)
@UseGuards(AccessControlGuard)
@Controller('admin')
@ApiTags('Administrative API. Guarded.')
export class AdminApiController {
  constructor(
    private readonly usersService: UsersService,
    private readonly blogService: BlogService,
    private readonly categoryService: CategoriesService,
    private readonly tasksService: TasksService,
    private readonly contactsService: ContactsService,
    private readonly commandBus: CommandBus
  ) {}

  @Get('all')
  // @ApiTags('Get a list of administrators')
  @ApiOperation({
    summary: 'Получает список всех пользователей-администраторов',
    description:
      'Получает список всех активированных пользователей-администраторов в системе (не включает главного администратора)',
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @ApiOkResponse({
    description: 'Ok',
    type: [CreatedAdminDto],
  })
  @AccessControlList({ role: UserRole.ADMIN, rights: [AccessRights.confirmUser] })
  public async getAdministrators() {
    const [activated, deactivated] = await Promise.all([
      this.usersService.getAdministrators(true),
      this.usersService.getAdministrators(false),
    ]);
    return [...activated, ...deactivated];
  }

  @Get('activated')
  @ApiTags('Get a list of activated administrators')
  @AccessControlList({ role: UserRole.ADMIN, isRoot: true })
  public async getActivatedAdmitistrators() {
    return this.usersService.getAdministrators(true);
  }

  @Get('deactivated')
  @ApiTags('Get a list of deactivated administrators')
  @AccessControlList({ role: UserRole.ADMIN, isRoot: true })
  public async getDeactivatedAdmitistrators() {
    return this.usersService.getAdministrators(false);
  }

  @Post('create')
  // @ApiTags('Create an administrative user. Root only.')
  @ApiOperation({
    summary: 'Создает нового администратора',
    description:
      'Создает нового пользователя с полномочиями администратора (не главный администратор). Только для главного администратора.',
  })
  @ApiBody({ type: NewAdminDto })
  @ApiCreatedResponse({
    description: 'Ok',
    type: CreatedAdminDto,
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, isRoot: true })
  async create(@Body() dto: NewAdminDto) {
    return this.usersService.createAdmin({
      role: UserRole.ADMIN,
      ...dto,
      permissions: [],
      isRoot: false,
    });
  }

  @Put(':id/activate')
  // @ApiTags('Activate an administrator. Root only.')
  @ApiOperation({
    summary: 'Активирует администратора',
    description: 'Активирует администратора. Только для главного администратора.',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор администратора',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: CreatedAdminDto,
    description: 'Возвращает объект администратора с обновленным значением isActive = true',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, isRoot: true })
  async activate(@Param('id') _id: string) {
    return this.commandBus.execute<ActivateUserCommand, { user: AnyUserInterface; token: string }>(
      new ActivateUserCommand(_id)
    );
  }

  @Delete(':id/activate')
  // @ApiTags('Block (deactivate) an administrator. Root only.')
  @ApiOperation({
    summary: 'Блокирует администратора',
    description: 'Блокирует администратора. Только для главного администратора.',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор администратора',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: CreatedAdminDto,
    description: 'Возвращает объект администратора с обновленным значением isActive = false',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, isRoot: true })
  async deactivate(@Param('id') _id: string) {
    return this.commandBus.execute<DeactivateAdminCommand, AnyUserInterface>(
      new DeactivateAdminCommand(_id)
    );
  }

  // Добавление привилегий администратору. Только root
  @Put(':id/privileges')
  // @ApiTags('Grant administrator privileges. Root only.')
  @ApiOperation({
    summary: 'Добавляет привилегий администратору',
    description:
      'Добавляет привилегий администратору. У каждого администратора есть шесть видов прав доступа: “Подтверждать аккаунты”, “Создавать заявки”, “Выдавать ключи”, “Решать споры”, “Контент блог”, “Повышение баллов”. Они не зависят друг от друга и могут использоваться в разных комбинациях. Только для главного администратора.',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор администратора',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiBody({ type: ApiPrivilegesDto })
  @ApiOkResponse({
    type: UpdatedAdminDto,
    description:
      'Возвращает объект администратора с обновленным значением permissions (массив с перечислением полномочий)',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, isRoot: true })
  public async grantPrivileges(
    @Param('id') userId,
    @Body() dto: ApiPrivilegesDto,
    @Req() req: Express.Request
  ) {
    const { privileges } = dto;
    return this.commandBus.execute<
      GrantAdminPrivilegesCommand,
      { user: AnyUserInterface; token: string }
    >(new GrantAdminPrivilegesCommand(req.user as AnyUserInterface, userId, privileges));
  }

  // Удаление привилегий администратора. Только root
  @Delete(':id/privileges')
  // @ApiTags('Revoke administrator privileges. Root only.')
  @ApiOperation({
    summary: 'Удаляет привилегии у администратора',
    description: 'Удаляет привилегии у администратора. Только для главного администратора.',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор администратора',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiBody({ type: ApiPrivilegesDto })
  @ApiOkResponse({
    type: UpdatedAdminDto,
    description:
      'Возвращает объект администратора с обновленным значением permissions (массив с перечислением полномочий)',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, isRoot: true })
  public async revokePrivileges(
    @Param('id') userId,
    @Body() dto: ApiPrivilegesDto,
    @Req() req: Express.Request
  ) {
    const { privileges } = dto;

    return this.commandBus.execute<
      RevokeAdminPrivilegesCommand,
      { user: AnyUserInterface; token: string }
    >(new RevokeAdminPrivilegesCommand(req.user as AnyUserInterface, userId, privileges));
  }

  // Обновление привилегий администратора. Только root
  @Patch(':id/privileges')
  // @ApiTags('Update administrator privileges. Root only.')
  @ApiOperation({
    summary: 'Обновляет привилегии администратора',
    description: 'Обновляет привилегии администратора. Только для главного администратора.',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор администратора',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiBody({ type: ApiPrivilegesDto })
  @ApiOkResponse({
    type: UpdatedAdminDto,
    description:
      'Возвращает объект администратора с обновленным значением permissions (массив с перечислением полномочий)',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, isRoot: true })
  public async updatePrivileges(
    @Param('id') userId,
    @Body() dto: ApiPrivilegesDto,
    @Req() req: Express.Request
  ) {
    const { privileges } = dto;

    return this.commandBus.execute<
      UpdateAdminPrivilegesCommand,
      { user: AnyUserInterface; token: string }
    >(new UpdateAdminPrivilegesCommand(req.user as AnyUserInterface, userId, privileges));
  }

  @Patch(':id/password')
  @ApiTags('Update administrator password. Root only.')
  @AccessControlList({ role: UserRole.ADMIN, isRoot: true })
  public async updatePassword(@Param('id') userId: string, @Body() body: SetAdminPasswordDto) {
    await this.commandBus.execute(new SetAdminPasswordCommand(userId, body.password));
  }

  @Put('users/:id/confirm')
  // @ApiTags('Confirm regular user. Limited access.')
  @ApiOperation({
    summary: 'Подтверждает пользователя',
    description: 'Подтверждает пользователя',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: UserDto,
    description: 'Возвращает объект пользователя со значением Status = 1 (CONFIRMED)',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, rights: [AccessRights.confirmUser] })
  async confirm(@Param('id') _id: string) {
    return this.commandBus.execute<ConfirmUserCommand, { user: AnyUserInterface; token: string }>(
      new ConfirmUserCommand(_id)
    );
  }

  @Delete('users/:id/confirm')
  // @ApiTags('Block regular user. Limited access.')
  @ApiOperation({
    summary: 'Блокирует пользователя',
    description: 'Блокирует пользователя',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: UserDto,
    description: 'Возвращает объект пользователя со значением Status = -1 (BLOCKED)',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, rights: [AccessRights.blockUser] })
  async block(@Param('id') _id: string) {
    return this.commandBus.execute<BlockUserCommand, AnyUserInterface>(new BlockUserCommand(_id));
  }

  @Put('users/:id/promote')
  // @ApiTags('Promote regular user (raise status). Limited access.')
  @ApiOperation({
    summary: 'Разблокирует пользователя',
    description: 'Разблокирует пользователя',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiOkResponse({
    type: UserDto,
    description: 'Возвращает объект пользователя со значением Status = 0 (UNCONFIRMED)',
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, rights: [AccessRights.promoteUser] })
  async upgrade(@Param('id') _id: string) {
    return this.commandBus.execute<UpgradeUserCommand, { user: AnyUserInterface; token: string }>(
      new UpgradeUserCommand(_id)
    );
  }

  @Delete('users/:id/promote')
  // @ApiTags('Downgrade regular user (lower status). Limited access.')
  @ApiOperation({
    summary: 'Обновляет (понижает) статус пользователя',
    description: 'Обновляет (понижает) статус пользователя',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: UserDto,
    description: 'Возвращает объект пользователя со значением Status = -1',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, isRoot: true })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async downgrade(@Param('id') _id: string) {
    throw new MethodNotAllowedException('Этот метод нельзя использовать здесь!');
    // return this.usersService.downgrade(_id);
  }

  @Put('users/:id/keys')
  // @ApiTags('Grant keys to regular user. Limited access.')
  @ApiOperation({
    summary: 'Выдает ключи пользователю',
    description: 'Выдает ключи пользователю',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: UserDto,
    description: 'Возвращает объект пользователя',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, rights: [AccessRights.giveKey] })
  async grantKeys(@Param('id') _id: string) {
    return this.commandBus.execute<
      GrantVolunteerKeysCommand,
      { user: AnyUserInterface; token: string }
    >(new GrantVolunteerKeysCommand(_id));
  }

  @Delete('users/:id/keys')
  @AccessControlList({ role: UserRole.ADMIN, isRoot: true })
  // @ApiTags('Revoke keys from regular user. Limited access.')
  @ApiOperation({
    summary: 'Удаляет ключи пользователю. Ограниченный доступ',
    description: 'Удаляет ключи пользователю. Ограниченный доступ',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: UserDto,
    description: 'Возвращает объект пользователя',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async revokeKeys(@Param('id') _id: string) {
    throw new MethodNotAllowedException('Этот метод нельзя использовать здесь!');
    //  return this.usersService.revokeKeys(_id);
  }

  // Получение всех задач произвольного пользователя
  @Get('users/:id/tasks')
  // @ApiTags('Get all tasks of regular user. Limited access.')
  @ApiOperation({
    summary: 'Получает все задачи пользователя по идентификатору',
    description: 'Получает все задачи пользователя по идентификатору',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользователя',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    description: 'Возвращает список задач пользователя',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN })
  async getTasks(@Param('id') _id: string): Promise<TaskInterface[]> {
    const user = (await this.usersService.getProfile(_id)) as unknown as AnyUserInterface;
    const results: TaskInterface[][] = await Promise.all(
      Object.values(TaskStatus).map((status) => this.tasksService.getOwnTasks(user, status))
    );
    return Promise.resolve(results.flat());
  }

  @Post('blog')
  // @ApiTags('Write a blog post. Limited access.')
  @ApiOperation({
    summary: 'Создает новый пост',
    description: 'Создает новый пост',
  })
  @ApiBody({ type: PostDTO })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiCreatedResponse({
    description: 'Ok',
    type: CreatedPostDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({
    role: UserRole.ADMIN,
    rights: [AccessRights.createPost, AccessRights.contentEditor],
  })
  async createPost(@Request() req: Express.Request, @Body() dto: PostDTO) {
    return this.blogService.create(dto, req.user);
  }

  @Patch('blog/:id')
  // @ApiTags('Edit a blog post. Limited access.')
  @ApiOperation({
    summary: 'Изменяет существующий пост',
    description: 'Изменяет существующий пост',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор поста',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: CreatedPostDto,
    description: 'Ok',
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({
    role: UserRole.ADMIN,
    rights: [AccessRights.updatePost, AccessRights.contentEditor],
  })
  async updatePost(@Request() req: Express.Request, @Param('id') id: string, @Body() dto: PostDTO) {
    return this.blogService.updatePost(id, dto, req.user);
  }

  @Delete('blog/:id')
  // @ApiTags('Delete a blog post. Limited access.')
  @ApiOperation({
    summary: 'Удаляет пост',
    description: 'Удаляет пост',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор поста',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: CreatedPostDto,
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({
    role: UserRole.ADMIN,
    rights: [AccessRights.deletePost, AccessRights.contentEditor],
  })
  async deletePost(@Request() req: Express.Request, @Param('id') id: string) {
    return this.blogService.deletePost(id, req.user);
  }

  @Post('category')
  // @ApiTags('Create a category. Root only.')
  @ApiOperation({
    summary: 'Создает категорию',
    description: 'Создает категорию. Только для главного администратора.',
  })
  @ApiBody({ type: ApiCreateCategoryDto })
  @ApiCreatedResponse({
    description: 'Ok',
    type: CreatedCategoryDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({
    role: UserRole.ADMIN,
    isRoot: true,
    rights: [AccessRights.categoryPoints],
  })
  public async createCategory(@Body() dto: ApiCreateCategoryDto, @Req() req: Express.Request) {
    return this.categoryService.createCategory(dto, req.user as AnyUserInterface);
  }

  @Patch('categories')
  // @ApiTags('Bulk update categories by ids. Admins only.')
  @ApiOperation({
    summary: 'Массово обновляет категории по идентификаторам',
    description: 'Массово обновляет категории по идентификаторам. Только для администраторов.',
  })
  @ApiBody({ type: ApiBulkUpdateCategoriesDto })
  @ApiOkResponse({
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({
    role: UserRole.ADMIN,
    rights: [AccessRights.categoryPoints],
  })
  async updateCategoriesByIds(
    @Body() dto: ApiBulkUpdateCategoriesDto,
    @Req() req: Express.Request
  ) {
    return this.categoryService.updateCategoriesByIds(dto, req.user as AnyUserInterface);
  }

  @Patch('categories/:id')
  // @ApiTags('Update category by id. Admins only.')
  @ApiOperation({
    summary: 'Обновляет категорию по идентификатору',
    description: 'Обновляет категорию по идентификатору. Только для администраторов.',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор категории',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: CreatedCategoryDto,
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({
    role: UserRole.ADMIN,
    rights: [AccessRights.categoryPoints],
  })
  async updateCategoryById(
    @Param('id')
    id: string,
    @Body() dto: ApiUpdateCategoryDto,
    @Req() req: Express.Request
  ) {
    return this.categoryService.updateCategoryById(id, dto, req.user as AnyUserInterface);
  }

  @Delete('categories/:id')
  // @ApiTags('Delete category by id. Root only.')
  @ApiOperation({
    summary: 'Удаляет категорию по идентификатору',
    description: 'Удаляет категорию по идентификатору. Только для главного администратора.',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор категории',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: CreatedCategoryDto,
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({
    role: UserRole.ADMIN,
    isRoot: true,
    rights: [AccessRights.categoryPoints],
  })
  async deleteCategoryById(@Param('id') id: string, @Req() req: Express.Request) {
    return this.categoryService.removeCategory(id, req.user as AnyUserInterface);
  }

  @Get('tasks/conflicted')
  // @ApiTags('Get a list of conflicted tasks. Limited access.')
  @ApiOperation({
    summary: 'Получает список конфликтных задач',
    description:
      'Получает список конфликтных задач. Доступно только администратору, у которого есть полномочия на обработку конфликтных заявок (AccessRights = "RESOLVE_CONFLICT")',
  })
  @ApiOkResponse({
    type: [ProcessedTaskDto],
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({
    role: UserRole.ADMIN,
    rights: [AccessRights.resolveConflict],
  })
  public async getConflictedTasks() {
    return this.tasksService.getVirginConflictTasks();
  }

  @Get('users/volunteers')
  // @ApiTags('Get a list of volunteers')
  @ApiOperation({
    summary: 'Получает список всех волонтеров',
    description:
      'Получает список всех волонтеров. Доступно только администратору, у которого есть полномочия на подтверждение пользователей (AccessRights = "CONFIRM_USER")',
  })
  @ApiOkResponse({
    type: [UserDto],
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, rights: [AccessRights.confirmUser] })
  public async getVolunteers() {
    return this.usersService.getUsersByRole(UserRole.VOLUNTEER);
  }

  @Get('users/recipients')
  // @ApiTags('Get a list of volunteers')
  @ApiOperation({
    summary: 'Получает список всех реципиентов',
    description:
      'Получает список всех реципиентов. Доступно только администратору, у которого есть полномочия на подтверждение пользователей (AccessRights = "CONFIRM_USER")',
  })
  @ApiOkResponse({
    type: [UserDto],
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, rights: [AccessRights.confirmUser] })
  public async getRecipients() {
    return this.usersService.getUsersByRole(UserRole.RECIPIENT);
  }

  @Get('users/unconfirmed')
  // @ApiTags('Get a list of volunteers')
  @ApiOperation({
    summary: 'Получает список неподтвержденных пользователей',
    description:
      'Получает список неподтвержденных пользователей. Доступно только администратору, у которого есть полномочия на подтверждение пользователей (AccessRights = "CONFIRM_USER")',
  })
  @ApiOkResponse({
    type: [UserDto],
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, rights: [AccessRights.confirmUser] })
  public async getUnconfirmed() {
    return this.usersService.getUnconfirmedUsers();
  }

  @Get('users/:id')
  @ApiOperation({
    summary: 'Получает пользователя по идентификатору',
    description:
      'Получает пользователя по идентификатору. Доступно только администратору, у которого есть полномочия на создание заявок (AccessRights = "CREATE_TASK")',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор пользотвателя',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: UserDto,
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, rights: [AccessRights.createTask] })
  async user(@Param('id') _id: string) {
    return this.usersService.getProfile(_id);
  }

  @Put('tasks/:id/resolve')
  // @ApiTags('Start moderation')
  @ApiOperation({
    summary: 'Начинает модерацию задачи',
    description:
      'Начинает модерацию задачи. Доступно только администратору, у которого есть полномочия на обработку конфликтных заявок (AccessRights = "RESOLVE_CONFLICT")',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор задачи',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: ProcessedTaskDto,
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, rights: [AccessRights.resolveConflict] })
  public async startModeration(@Param('id') taskId: string, @Req() req: Express.Request) {
    return this.tasksService.startModeration(taskId, req.user as AnyUserInterface);
  }

  @Put('tasks/:id/resolve/fulfill')
  // @ApiTags('Resolve conflict as fulfilled')
  @ApiOperation({
    summary: 'Закрывает выполненную заявку',
    description:
      'Закрывает выполненную заявку. Доступно только администратору, у которого есть полномочия на обработку конфликтных заявок (AccessRights = "RESOLVE_CONFLICT")',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор задачи',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: ProcessedTaskDto,
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, rights: [AccessRights.resolveConflict] })
  public async resolveFulfilled(@Param('id') taskId: string) {
    return this.tasksService.resolveConflict(taskId, ResolveResult.FULFILLED);
  }

  @Put('tasks/:id/resolve/reject')
  // @ApiTags('Resolve conflict as rejected')
  @ApiOperation({
    summary: 'Закрывает невыполненную заявку',
    description:
      'Закрывает невыполненную заявку. Доступно только администратору, у которого есть полномочия на обработку конфликтных заявок (AccessRights = "RESOLVE_CONFLICT")',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор задачи',
    type: 'string',
    example: '66e00d39886d5b0bae564611',
    required: true,
  })
  @ApiOkResponse({
    type: ProcessedTaskDto,
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, rights: [AccessRights.resolveConflict] })
  public async resolveRejected(@Param('id') taskId: string) {
    return this.tasksService.resolveConflict(taskId, ResolveResult.REJECTED);
  }

  @Get('/tasks/moderated')
  // @ApiTags('Get moderated by admin')
  @ApiOperation({
    summary: 'Получает список задач на модерации',
    description:
      'Получает список задач на модерации. Доступно только администратору, у которого есть полномочия на обработку конфликтных заявок (AccessRights = "RESOLVE_CONFLICT")',
  })
  @ApiOkResponse({
    type: [ProcessedTaskDto],
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, rights: [AccessRights.resolveConflict] })
  public async getModeratedTasks(@Req() req: Express.Request) {
    return this.tasksService.getModeratedTasks(req.user as AnyUserInterface);
  }

  @Patch('contacts')
  // @ApiTags('Update a contacts data. Root only.')
  @ApiOperation({
    summary: 'Обновляет контактные данные',
    description: 'Обновляет контактные данные. Только для главного администратора.',
  })
  @ApiBody({ type: ContactInfoDto })
  @ApiOkResponse({
    type: UpdatedContactsDto,
    description: 'Ok',
  })
  @ApiUnauthorizedResponse({
    description: 'Отсутствуют необходимые полномочия для выполнения данной операции',
    type: UnauthorizedErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный запрос',
    type: BadRequestErrorResponseDto,
  })
  @AccessControlList({ role: UserRole.ADMIN, isRoot: true })
  public async updateContacts(@Body() dto: UpdateContactsRequestDto) {
    return this.contactsService.update(dto);
  }
}
