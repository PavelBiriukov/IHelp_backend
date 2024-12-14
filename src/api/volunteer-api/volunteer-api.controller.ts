import { Controller, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
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
import { GetVirginTasksQuery } from '../../common/commands-and-queries/get-virgin-tasks.query';
import { GeoCoordinates } from '../../common/types/point-geojson.types';

@UseGuards(JwtAuthGuard)
@UseGuards(AccessControlGuard)
@Controller('volunteer')
export class VolunteerApiController {
  constructor(
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
    private readonly queryBus: QueryBus
  ) {}

  @AccessControlList({ role: UserRole.VOLUNTEER, level: UserStatus.UNCONFIRMED })
  @Get('tasks/virgin')
  public async getNewTasks(@Req() req: Express.Request, @Query() query: GetTasksSearchDto) {
    const { latitude, longitude, distance, categoryId, start, end } = query;
    const location: GeoCoordinates = [longitude, latitude];
    const dto = {
      location,
      distance,
      categoryId,
      start,
      end,
    };
    return this.queryBus.execute<GetVirginTasksQuery>(
      new GetVirginTasksQuery(TaskStatus.CREATED, dto, req.user as AnyUserInterface)
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
    return this.tasksService.reportTask(id, userId, UserRole.VOLUNTEER, TaskReport.FULFILLED);
  }

  @Put('/tasks/:id/reject')
  @AccessControlList({ role: UserRole.VOLUNTEER, level: UserStatus.CONFIRMED })
  public async rejectTask(@Param('id') id: string, @Req() req: Express.Request) {
    const { _id: userId } = req.user as AnyUserInterface;
    return this.tasksService.reportTask(id, userId, UserRole.VOLUNTEER, TaskReport.REJECTED);
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
}
