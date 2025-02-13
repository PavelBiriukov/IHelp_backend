import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BlogService } from '../../core/blog/blog.service';
import { Public } from '../../common/decorators/public.decorator';
import { CategoriesService } from '../../core/categories/categories.service';
import { TasksService } from '../../core/tasks/tasks.service';
import { GetTasksQueryDto } from '../recipient-api/dto/get-tasks-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from '../../core/users/users.service';
import { AnyUserInterface } from '../../common/types/user.types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ContactsService } from '../../core/contacts/contacts.service';
import { PolicyService } from '../../core/policy/policy.service';
import { UpdateUserProfileCommand } from '../../common/commands/update-user-profile.command';
import { ensureStringId } from '../../common/helpers/ensure-string-id';
import { GetChatMessagesQuery } from '../../common/queries/get-chat-messages.query';
import { ChatPageRequestQueryDto, MessageInterface } from '../../common/types/chats.types';
import { schema } from '../../common/utils/apiSchemaObj';
import { ChatPageResponseDto } from './dto/chat-page-response-dto';

@Controller('system')
export class SystemApiController {
  constructor(
    private readonly blogService: BlogService,
    private readonly categoriesService: CategoriesService,
    private readonly taskService: TasksService,
    private readonly userService: UsersService,
    private readonly contactsService: ContactsService,
    private readonly policyService: PolicyService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get('posts')
  @Public()
  public async getAllBlogPosts() {
    return this.blogService.getAllPosts();
  }

  @Get('posts/:id')
  @Public()
  public async getBlogPost(@Param('id') id: string) {
    return this.blogService.getPost(id);
  }

  @Get('categories')
  @Public()
  public async getCategories() {
    return this.categoriesService.getCategories();
  }

  @Get('categories/:id')
  @Public()
  public async getCategory(@Param('id') categoryId: string) {
    return this.categoriesService.getCategoryById(categoryId);
  }

  @Get('tasks/virgin')
  @Public()
  public async getVirginTasks(@Query() query: GetTasksQueryDto) {
    const { latitude, longitude, ...data } = query;
    return this.taskService.getAllVirginTasks({
      ...data,
      location: [longitude, latitude],
    });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  public async getProfile(@Req() req: Express.Request) {
    const { _id } = req.user as AnyUserInterface;
    return this.userService.getProfile(typeof _id === 'string' ? _id : _id.toString());
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  public async updateProfile(@Req() req: Express.Request, @Body() dto: UpdateProfileDto) {
    const { _id } = req.user as AnyUserInterface;

    return this.commandBus.execute<
      UpdateUserProfileCommand,
      { user: AnyUserInterface; token: string }
    >(new UpdateUserProfileCommand(ensureStringId(_id), dto));
  }

  @Get('contacts')
  @Public()
  public async getContacts() {
    return this.contactsService.getActual();
  }

  @Get('policy')
  @Public()
  public async getPolicy() {
    return this.policyService.getActual();
  }

  @Get('chats/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить сообщения чата по его _id' })
  @ApiParam({ name: 'id', type: 'string', description: '_id чата' })
  @ApiQuery({ name: 'skip', type: 'number', description: 'Количество пропускаемых сообщений' })
  @ApiQuery({ name: 'limit', type: 'number', description: 'Количество запрашиваемых сообщений' })
  @ApiOkResponse({
    description: 'Присланы сообщения чата в соответствии с запросом',
    type: ChatPageResponseDto,
  })
  @ApiBadRequestResponse({
    schema: schema(['string'], 'Bad Request', 400),
    description: 'Переданы не верные данные',
  })
  @ApiUnauthorizedResponse({
    schema: schema('Unauthorized', null, 401),
    description: 'Требуется авторизация',
  })
  @ApiForbiddenResponse({
    schema: schema('Forbidden resource', 'Forbidden', 403),
    description: 'У Вас нет прав доступа к данному чату',
  })
  @ApiInternalServerErrorResponse({
    schema: schema('Внутренняя ошибка сервера', null, 500),
    description: 'Внутрення ошибка на сервере',
  })
  public async getChatMessages(
    @Query() query: ChatPageRequestQueryDto,
    @Param('id') chatId: string
  ) {
    const { skip, limit } = query;
    return {
      messages: await this.queryBus.execute<GetChatMessagesQuery, Array<MessageInterface>>(
        new GetChatMessagesQuery(chatId, skip, limit)
      ),
    };
  }
}
