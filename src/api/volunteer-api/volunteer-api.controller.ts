import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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
import { ensureStringId } from '../../common/helpers/ensure-string-id';
import { ReleaseTaskVolunteerCommand } from '../../common/commands/release-task-volunteer.command';

@UseGuards(JwtAuthGuard)
@UseGuards(AccessControlGuard)
@Controller('volunteer')
export class VolunteerApiController {
  constructor(
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
    private readonly commandBus: CommandBus
  ) {}

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

  @AccessControlList({ role: UserRole.VOLUNTEER, level: UserStatus.CONFIRMED })
  @Put('tasks/:id/accept')
  public async accept(@Req() req: Express.Request, @Param('id') taskId: string) {
    return this.tasksService.acceptTask(taskId, req.user as User & Volunteer);
  }

  @Put('/tasks/:id/fulfill')
  @AccessControlList({ role: UserRole.VOLUNTEER, level: UserStatus.CONFIRMED })
  public async fulfillTask(@Param('id') id: string, @Req() req: Express.Request) {
    const { _id: userId } = req.user as AnyUserInterface;
    return this.tasksService.reportTask(
      id,
      ensureStringId(userId),
      UserRole.VOLUNTEER,
      TaskReport.FULFILLED
    );
  }

  @Put('/tasks/:id/reject')
  @AccessControlList({ role: UserRole.VOLUNTEER, level: UserStatus.CONFIRMED })
  public async rejectTask(@Param('id') id: string, @Req() req: Express.Request) {
    const { _id: userId } = req.user as AnyUserInterface;
    return this.tasksService.reportTask(
      id,
      ensureStringId(userId),
      UserRole.VOLUNTEER,
      TaskReport.REJECTED
    );
  }

  @Get('/tasks/accepted')
  @AccessControlList({ role: UserRole.VOLUNTEER, level: UserStatus.CONFIRMED })
  public async getAcceptedTasks(@Query() query: GetTasksSearchDto, @Req() req: Express.Request) {
    const { latitude, longitude, ...data } = query;
    return this.tasksService.getOwnTasks(req.user as AnyUserInterface, TaskStatus.ACCEPTED, {
      ...data,
      location: [longitude, latitude],
    });
  }

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

  @Delete('/tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiTags('Release the task by volunteer')
  @ApiOperation({
    summary: 'Снимает задачу с волонтера',
    description:
      'Снимает задачу с волонтера, если она не постоянная/бессрочная и до начала выполнения осталось более 24 часов',
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор задачи',
    type: 'string',
    example: '675db87355d51b00eafc7c5a',
    required: true,
  })
  @ApiOkResponse({
    status: 204,
  })
  @ApiResponse({
    status: 500,
    description: 'Не удалось снять задачу с волонтёра, произошла внутренняя ошибка сервера',
  })
  @AccessControlList({ role: UserRole.VOLUNTEER, level: UserStatus.CONFIRMED })
  public async deleteTaskById(@Param('id') taskId: string, @Req() req: Express.Request) {
    const result = await this.commandBus.execute<ReleaseTaskVolunteerCommand, boolean>(
      new ReleaseTaskVolunteerCommand(taskId, req.user as AnyUserInterface)
    );

    if (result === false) {
      throw new InternalServerErrorException({
        message: 'Не удалось снять задачу с волонтёра, произошла внутренняя ошибка сервера',
      });
    } else return {};
  }
}
