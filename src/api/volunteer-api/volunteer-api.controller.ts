import { Controller, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AccessControlGuard } from '../../common/guards/access-control.guard';
import { UsersService } from '../../core/users/users.service';
import { TasksService } from '../../core/tasks/tasks.service';
import { AccessControlList } from '../../common/decorators/access-control-list.decorator';
import { AnyUserInterface, UserRole, UserStatus } from '../../common/types/user.types';
import { User } from '../../datalake/users/schemas/user.schema';
import { Volunteer } from '../../datalake/users/schemas/volunteer.schema';
import { GetTasksSearchDto } from '../recipient-api/dto/get-tasks-query.dto';
import { TaskReport, TaskStatus } from '../../common/types/task.types';
import { ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Task } from 'src/datalake/task/schemas/task.schema';

@UseGuards(JwtAuthGuard)
@UseGuards(AccessControlGuard)
@ApiTags('volunteer')
@Controller('volunteer')
export class VolunteerApiController {
  constructor(
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService
  ) {}

  @ApiOperation({ summary: 'Получение новых задач по статусу' })
  @ApiQuery({ type: GetTasksSearchDto })
  @ApiOkResponse({ type: Promise<Task[]> })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiForbiddenResponse({ description: 'Требуется другой статус или роль' })
  @ApiBadRequestResponse({ description: 'Ошибка запроса. В нём есть пользователь?' })
  @AccessControlList({ role: UserRole.VOLUNTEER, level: UserStatus.UNCONFIRMED })
  @Get('tasks/virgin')
  public async getNewTasks(@Req() req: Express.Request, @Query() query: GetTasksSearchDto) {
    const { latitude, longitude, distance, ...data } = query;
    return this.tasksService.getTasksByStatus(
      TaskStatus.CREATED,
      {
        ...data,
        location: [longitude, latitude],
        distance,
      },
      req.user as AnyUserInterface
    );
  }

  @ApiOperation({ summary: 'Принятие задачи' })
  @ApiParam({ name: 'id', type: 'String' })
  @ApiOkResponse({ type: Promise<Task> })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiForbiddenResponse({ description: 'Требуется другой статус или роль' })
  @ApiBadRequestResponse({ description: 'Ошибка запроса. В нём есть пользователь?' })
  @ApiConflictResponse({ description: 'Нельзя повторно взять задание или оно взято другим волонтёром' })
  @AccessControlList({ role: UserRole.VOLUNTEER, level: UserStatus.CONFIRMED })
  @Put('tasks/:id/accept')
  public async accept(@Req() req: Express.Request, @Param('id') taskId: string) {
    return this.tasksService.acceptTask(taskId, req.user as User & Volunteer);
  }

  @ApiOperation({ summary: 'Успешное завершение задачи' })
  @ApiParam({ name: 'id', type: 'String' })
  @ApiOkResponse({ type: Promise<Task> })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiForbiddenResponse({ description: 'Требуется другой статус или роль' })
  @ApiBadRequestResponse({ description: 'Ошибка запроса. В нём есть пользователь?' })
  @ApiConflictResponse({ description: 'Нельзя повторно отчитаться о задаче' })
  @Put('/tasks/:id/fulfill')
  @AccessControlList({ role: UserRole.VOLUNTEER, level: UserStatus.CONFIRMED })
  public async fulfillTask(@Param('id') id: string, @Req() req: Express.Request) {
    const { _id: userId } = req.user as AnyUserInterface;
    return this.tasksService.reportTask(id, userId, UserRole.VOLUNTEER, TaskReport.FULFILLED);
  }

  @ApiOperation({ summary: 'Отказ от задачи' })
  @ApiParam({ name: 'id', type: 'String' })
  @ApiOkResponse({ type: Promise<Task> })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiForbiddenResponse({ description: 'Требуется другой статус или роль' })
  @ApiBadRequestResponse({ description: 'Ошибка запроса. В нём есть пользователь?' })
  @ApiConflictResponse({ description: 'Нельзя повторно отчитаться о задаче' })
  @Put('/tasks/:id/reject')
  @AccessControlList({ role: UserRole.VOLUNTEER, level: UserStatus.CONFIRMED })
  public async rejectTask(@Param('id') id: string, @Req() req: Express.Request) {
    const { _id: userId } = req.user as AnyUserInterface;
    return this.tasksService.reportTask(id, userId, UserRole.VOLUNTEER, TaskReport.REJECTED);
  }

  @ApiOperation({ summary: 'Получение подтвержденных задач' })
  @ApiQuery({ type: GetTasksSearchDto })
  @ApiOkResponse({ type: Promise<Task[]> })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiForbiddenResponse({ description: 'Требуется другой статус или роль' })
  @ApiBadRequestResponse({ description: 'Ошибка запроса. В нём есть пользователь?' })
  @Get('/tasks/accepted')
  @AccessControlList({ role: UserRole.VOLUNTEER, level: UserStatus.CONFIRMED })
  public async getAcceptedTasks(@Query() query: GetTasksSearchDto, @Req() req: Express.Request) {
    const { latitude, longitude, ...data } = query;
    return this.tasksService.getOwnTasks(req.user as AnyUserInterface, TaskStatus.ACCEPTED, {
      ...data,
      location: [longitude, latitude],
    });
  }

  @ApiOperation({ summary: 'Получение завершенных задач' })
  @ApiQuery({ type: GetTasksSearchDto })
  @ApiOkResponse({ type: Promise<Task[]> })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiForbiddenResponse({ description: 'Требуется другой статус или роль' })
  @ApiBadRequestResponse({ description: 'Ошибка запроса. В нём есть пользователь?' })
  @Get('/tasks/completed')
  @AccessControlList({ role: UserRole.VOLUNTEER, level: UserStatus.CONFIRMED })
  public async getCompletedTasks(@Query() query: GetTasksSearchDto, @Req() req: Express.Request) {
    const { latitude, longitude, ...data } = query;
    const completed = await this.tasksService.getOwnTasks(
      req.user as AnyUserInterface,
      TaskStatus.COMPLETED,
      {
        ...data,
        location: [longitude, latitude],
      }
    );
    const conflicted = await this.tasksService.getOwnTasks(
      req.user as AnyUserInterface,
      TaskStatus.CONFLICTED,
      {
        ...data,
        location: [longitude, latitude],
      }
    );
    return Promise.resolve([...completed, ...conflicted]);
  }
}
