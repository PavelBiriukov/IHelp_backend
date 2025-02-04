import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { dayInMs } from '../../common/constants';
import { UpdateVolunteerProfileCommand } from '../../common/commands/update-volunteer-profile.command';
import { TasksRepository } from '../../datalake/task/task.repository';
import { UsersRepository } from '../../datalake/users/users.repository';
import { CreateTaskDto, GetTasksDto } from '../../common/dto/tasks.dto';
import { CategoryRepository } from '../../datalake/category/category.repository';
import { Task } from '../../datalake/task/schemas/task.schema';
import {
  ResolveResult,
  ResolveStatus,
  TaskModelInterface,
  TaskReport,
  TaskStatus,
  TaskClosingProps,
  FulfilledTaskClosingProps,
  TaskClosingConditionalProps,
  TaskInterface,
} from '../../common/types/task.types';
import { AnyUserInterface, UserRole } from '../../common/types/user.types';
import { Volunteer } from '../../datalake/users/schemas/volunteer.schema';
import { User } from '../../datalake/users/schemas/user.schema';
import {
  CreateTaskChatCommand,
  CreateTaskChatCommandType,
} from '../../common/commands/create-chat.command';
import { CloseTaskChatByTaskIdCommand } from '../../common/commands/close-task-chat-by-taskId.command';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepo: TasksRepository,
    private readonly usersRepo: UsersRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  public async create(dto: CreateTaskDto) {
    const { recipientId, categoryId, location, ...data } = dto;
    const recipient = await this.usersRepo.findById(recipientId);
    const category = await this.categoryRepo.findById(categoryId);
    const { points, accessLevel, title } = category;
    if (![`${UserRole.ADMIN}`, `${UserRole.RECIPIENT}`].includes(recipient.role)) {
      throw new ForbiddenException('Только реципиент или администратор могут создавать заявки', {
        cause: `Попытка создать заявку пользователем с _id ${recipientId} и ролью ${recipient.role}`,
      });
    }
    const { name, phone, avatar, address, _id, vkId, role } = recipient;
    const task = {
      ...data,
      recipient: { name, phone, avatar, address, _id, vkId, role },
      volunteer: null,
      status: TaskStatus.CREATED,
      category: { points, accessLevel, title, _id: categoryId },
      isPendingChanges: false,
      location: { type: 'Point', coordinates: location },
    };
    return this.tasksRepo.create(task);
  }

  public async getTask(taskId: string) {
    return this.tasksRepo.findById(taskId);
  }

  public async getVirginConflictTasks() {
    return this.tasksRepo.find({
      status: TaskStatus.CONFLICTED,
      adminResolve: ResolveStatus.VIRGIN,
    });
  }

  public async getAllVirginTasks(dto: Partial<GetTasksDto>) {
    const { location: center, distance } = dto;
    const query: FilterQuery<Task> = {
      status: TaskStatus.CREATED,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: center },
          $maxDistance: distance,
        },
      },
    };
    return this.tasksRepo.find(query);
  }

  public async startModeration(taskId: string, moderator: AnyUserInterface) {
    const { name, phone, avatar, address, _id, vkId, role } = moderator;
    const task = await this.tasksRepo.findById(taskId);
    if (moderator.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Только администратор может разрешать конфликты', {
        cause: `Попытка взять на модерацию задачу пользователем с _id '${moderator._id}' и ролью '${moderator.role}'`,
      });
    }
    if (
      task.status !== TaskStatus.CONFLICTED ||
      task.adminResolve !== ResolveStatus.VIRGIN ||
      !!task.moderator
    ) {
      throw new ForbiddenException('Задача не является конфликтной или конфликт уже модерируется', {
        cause: `Попытка администратора с _id '${_id}' взять на модерирование задачу с _id '${taskId}', у которой status = '${
          task.status
        }, adminResolve = '${task.adminResolve}', а moderator ${
          task.moderator ? 'не' : ''
        } равен null.`,
      });
    }
    return this.tasksRepo.findOneAndUpdate(
      { _id: taskId, status: TaskStatus.CONFLICTED, adminResolve: ResolveStatus.VIRGIN },
      {
        adminResolve: ResolveStatus.PENDING,
        moderator: { name, phone, avatar, address, _id, vkId, role },
      }
    );
  }

  public async resolveConflict(taskId: string, outcome: ResolveResult) {
    const task = await this.tasksRepo.findById(taskId);
    if (task.status !== TaskStatus.CONFLICTED) {
      throw new ForbiddenException(
        'Разрешение конфликта доступно только для задач, которые закрыты с конфликтом',
        {
          cause: `Попытка разрешения конфликта по задаче с _id '${task._id}' со статусом ${task.status} `,
        }
      );
    }

    if (outcome === ResolveResult.FULFILLED) {
      return this.closeTaskAsFulfilled({
        taskId,
        volunteerId: task.volunteer._id,
        categoryPoints: task.category.points,
        adminResolveResult: ResolveResult.FULFILLED,
      });
    }

    return this.closeTaskAsRejected({
      taskId,
      adminResolveResult: ResolveResult.REJECTED,
    });
  }

  public async getModeratedTasks(moderator: AnyUserInterface) {
    const { _id, role, address, avatar, name, phone } = moderator;
    return this.tasksRepo.find({
      status: TaskStatus.CONFLICTED,
      adminResolve: ResolveStatus.PENDING,
      moderator: { _id, role, address, avatar, name, phone },
    });
  }

  public async updateTask(taskId: string, user: AnyUserInterface, dto: Partial<CreateTaskDto>) {
    const { location, ...data } = dto;
    const task = {
      ...data,
      location: { type: 'Point', coordinates: location },
    };
    const { _id: userId, role, address, avatar, name, phone } = user;
    if (!(role === UserRole.RECIPIENT || role === UserRole.ADMIN)) {
      throw new ForbiddenException(
        'Вы не можете редактировать эту задачу: недостаточно полномочий',
        {
          cause: `Попытка редактировать задачу '${taskId} пользователем '${userId} с ролью '${role}'. `,
        }
      );
    }
    const query: FilterQuery<Task> = {
      _id: taskId,
      status: TaskStatus.CREATED,
    };
    if (role === UserRole.RECIPIENT) {
      query.recipient = { _id: userId, address, avatar, name, phone };
    }
    return this.tasksRepo.findOneAndUpdate(query, task);
  }

  public async getTasksByStatus(
    taskStatus: TaskStatus,
    dto: Partial<GetTasksDto>,
    user?: AnyUserInterface
  ) {
    const { location: center, distance, start, end /* , categoryId */ } = dto;
    const query: FilterQuery<TaskModelInterface> = {
      status: taskStatus,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: center },
          $maxDistance: distance,
        },
      },
      //     category: {},
    };
    /*   if (categoryId) {
      console.dir(`categoryId = ${categoryId}.`);
      query.category._id = categoryId;
    }
    if (!!user && !!user.status) {
      query.category.accessLevel = { $lte: user.status };
    }
 */
    if (!!start && !!end) {
      query.date = {
        $gte: start,
        $lte: end,
      };
    } else if (!!start && !end) {
      query.date = {
        $gte: start,
      };
    } else if (!start && !!end) {
      query.date = {
        $lte: end,
      };
    }
    const res = await this.tasksRepo.find(query);
    return res.filter((tsk) => {
      if (tsk && tsk.category && user && user.status) {
        return tsk.category.accessLevel <= user.status;
      }
      return true;
    });
  }

  public async getOwnTasks(user: AnyUserInterface, status: TaskStatus, dto?: GetTasksDto) {
    const { location: center, distance, start, end, categoryId } = dto ?? {};
    const { _id, role, address, avatar, name, phone } = user;
    const roleIndex = role.toLowerCase();
    const query: FilterQuery<Task> = {
      status,
      [roleIndex]: { _id, address, avatar, name, phone },
    };
    if (!!center && center.length === 2 && !!distance) {
      query.location = {
        $near: {
          $geometry: center,
          $maxDistance: distance,
        },
      };
    }
    if (categoryId) {
      query.category = { _id: categoryId };
    }
    if (!!start && !!end) {
      query.date = {
        $gte: start,
        $lte: end,
      };
    } else if (!!start && !end) {
      query.date = {
        $gte: start,
      };
    } else if (!start && !!end) {
      query.date = {
        $lte: end,
      };
    }
    return this.tasksRepo.find(query);
  }

  public async acceptTask(taskId: string, volunteer: User & Volunteer) {
    if (![`${UserRole.ADMIN}`, `${UserRole.VOLUNTEER}`].includes(volunteer.role)) {
      throw new ForbiddenException('Только волонтёр или администратор могут создавать заявки', {
        cause: `Попытка создать заявку пользователем с _id '${volunteer.id}' и ролью '${volunteer.role}'`,
      });
    }
    const task = await this.tasksRepo.findById(taskId);
    if (task.volunteer) {
      throw new ConflictException('Эта заявка уже взята другим волонтёром', {
        cause: `Попытка повторно взять заявку с _id '${taskId}' пользователем с _id '${volunteer.id}' и ролью '${volunteer.role}'`,
      });
    }
    if (task.status !== TaskStatus.CREATED) {
      throw new ConflictException(
        `Нельзя повторно принять уже ${
          task.status === TaskStatus.COMPLETED ? 'завершённое' : 'исполняемое'
        } задание`,
        {
          cause: `Попытка взять заявку со статусом '${task.status}' !=== '${TaskStatus.CREATED}' пользователем с _id '${volunteer.id}' и ролью '${volunteer.role}'`,
        }
      );
    }
    if (volunteer.role === UserRole.VOLUNTEER && volunteer.status < task.category.accessLevel) {
      throw new ForbiddenException('Вам нельзя брать задачи из этой категории!');
    }
    const { name, phone, avatar, address, _id, vkId, role } = volunteer;
    const updatedTask = await this.tasksRepo.findByIdAndUpdate(
      taskId,
      { status: TaskStatus.ACCEPTED, volunteer: { name, phone, avatar, address, _id, vkId, role } },
      { new: true }
    );
    const data: CreateTaskChatCommandType = { updatedTask: updatedTask as TaskInterface };
    await this.commandBus.execute(new CreateTaskChatCommand(data));
    return updatedTask;
  }

  public async reportTask(taskId: string, userId: string, userRole: UserRole, result: TaskReport) {
    const myIndex = userRole === UserRole.VOLUNTEER ? 'volunteerReport' : 'recipientReport';
    const counterpartyIndex =
      userRole === UserRole.RECIPIENT ? 'volunteerReport' : 'recipientReport';
    const task = await this.tasksRepo.findById(taskId);

    if (task.status === TaskStatus.CREATED) {
      throw new ForbiddenException('Нельзя отчитаться по не открытой задаче!', {
        cause: `Попытка отчёта по задаче с _id '${task._id}' со статусом ${task.status} `,
      });
    } else if (
      task.status === TaskStatus.COMPLETED ||
      task.status === TaskStatus.CONFLICTED ||
      !!task[myIndex]
    ) {
      throw new ConflictException('Нельзя повторно отчитаться по задаче!', {
        cause: `Попытка повторного  отчёта по задаче с _id '${task._id}' со статусом ${task.status} `,
      });
    }

    if (!task[counterpartyIndex]) {
      return this.tasksRepo.findByIdAndUpdate(
        taskId,
        {
          [myIndex]: result,
          isPendingChanges: true,
        },
        { new: true }
      );
    }

    if (result === task[counterpartyIndex]) {
      if (result === TaskReport.FULFILLED) {
        return this.closeTaskAsFulfilled({
          taskId,
          volunteerId: task.volunteer._id,
          categoryPoints: task.category.points,
          userIndex: myIndex,
        });
      }
      return this.closeTaskAsRejected({
        taskId,
        userIndex: myIndex,
      });
    }
    const [conflictedTask] = await Promise.all([
      this.tasksRepo.findByIdAndUpdate(
        taskId,
        {
          [myIndex]: result,
          status: TaskStatus.CONFLICTED,
          adminResolve: ResolveStatus.VIRGIN,
          isPendingChanges: true,
        },
        { new: true }
      ),
      this.commandBus.execute<CloseTaskChatByTaskIdCommand, boolean>(
        new CloseTaskChatByTaskIdCommand(taskId)
      ),
    ]);
    return conflictedTask as Task;
  }

  public async cancelTask(taskId: string, user: AnyUserInterface) {
    const task = await this.tasksRepo.findById(taskId);
    const { recipient, volunteer } = task;
    if (recipient._id !== user._id) {
      throw new ForbiddenException('Нельзя отменить чужую задачу!', {
        cause: `Попытка пользователя с _id '${user._id} удалить задачу с _id '${taskId}', созданную не им`,
      });
    }
    if (volunteer) {
      throw new ForbiddenException('Нельзя отменить задачу, которую уже взял волонтёр!', {
        cause: `Попытка пользователя с _id '${user._id} удалить задачу с _id '${taskId}', которую уже взял волонтёр с _id '${volunteer._id}`,
      });
    }

    const [deleteResult] = await Promise.all([
      this.tasksRepo.deleteOne({ _id: taskId }, {}),
      this.commandBus.execute<CloseTaskChatByTaskIdCommand, boolean>(
        new CloseTaskChatByTaskIdCommand(taskId)
      ),
    ]);
    return deleteResult;
  }

  async closeTaskAsFulfilled({
    taskId,
    volunteerId,
    categoryPoints,
    adminResolveResult,
    userIndex,
  }: FulfilledTaskClosingProps & TaskClosingConditionalProps) {
    const volunteer = (await this.usersRepo.findById(volunteerId)) as User & Volunteer;

    if (!volunteer) {
      throw new NotFoundException('Пользователь не найден!', {
        cause: `Пользователь с _id '${volunteerId}' не найден`,
      });
    }

    let volunteerUpdateResult: PromiseSettledResult<User & AnyUserInterface>;
    let taskUpdateResult: PromiseSettledResult<Task>;

    if (!userIndex) {
      [volunteerUpdateResult, taskUpdateResult] = await Promise.allSettled([
        this.commandBus.execute<UpdateVolunteerProfileCommand>(
          new UpdateVolunteerProfileCommand(volunteer._id, {
            score: volunteer.score + categoryPoints || volunteer.score,
            tasksCompleted: volunteer.tasksCompleted + 1,
          })
        ),
        this.tasksRepo.findByIdAndUpdate(
          taskId,
          {
            [userIndex]: TaskReport.FULFILLED,
            status: TaskStatus.COMPLETED,
            adminResolve: adminResolveResult || null,
            isPendingChanges: false,
          },
          { new: true }
        ),
        this.commandBus.execute<CloseTaskChatByTaskIdCommand, boolean>(
          new CloseTaskChatByTaskIdCommand(taskId)
        ),
      ]);
    }

    [volunteerUpdateResult, taskUpdateResult] = await Promise.allSettled([
      this.commandBus.execute<UpdateVolunteerProfileCommand>(
        new UpdateVolunteerProfileCommand(volunteer._id, {
          score: volunteer.score + categoryPoints || volunteer.score,
          tasksCompleted: volunteer.tasksCompleted + 1,
        })
      ),

      this.tasksRepo.findByIdAndUpdate(
        taskId,
        {
          status: TaskStatus.COMPLETED,
          adminResolve: adminResolveResult || null,
        },
        { new: true }
      ),
      this.commandBus.execute<CloseTaskChatByTaskIdCommand, boolean>(
        new CloseTaskChatByTaskIdCommand(taskId)
      ),
    ]);

    if (volunteerUpdateResult.status === 'rejected') {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: `Обновление данных волонтера не выполнено или выполнено с ошибкой: ${volunteerUpdateResult.reason}`,
      });
    }

    if (taskUpdateResult.status === 'rejected') {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: `Обновление данных задачи не выполнено или выполнено с ошибкой: ${taskUpdateResult.reason}`,
      });
    }
    const res = taskUpdateResult as PromiseFulfilledResult<Task>;
    return res.value;
  }

  private async closeTaskAsRejected({
    taskId,
    adminResolveResult,
    userIndex,
  }: TaskClosingProps & TaskClosingConditionalProps) {
    let updatedTask: Task;

    if (userIndex) {
      updatedTask = await this.tasksRepo.findByIdAndUpdate(
        taskId,
        {
          [userIndex]: TaskReport.REJECTED,
          status: TaskStatus.COMPLETED,
          adminResolve: adminResolveResult || null,
          isPendingChanges: false,
        },
        { new: true }
      );
    }

    updatedTask = await this.tasksRepo.findByIdAndUpdate(
      taskId,
      {
        status: TaskStatus.COMPLETED,
        adminResolve: adminResolveResult || null,
      },
      { new: true }
    );

    if (!updatedTask) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: 'Обновление данных задачи не выполнено или выполнено с ошибкой',
      });
    }
    await this.commandBus.execute<CloseTaskChatByTaskIdCommand, boolean>(
      new CloseTaskChatByTaskIdCommand(taskId)
    );
    return updatedTask;
  }

  public async updateTaskPoints(points: number, id: string) {
    const res = await this.tasksRepo.updateMany(
      {
        'category._id': id,
        status: { $in: [TaskStatus.ACCEPTED, TaskStatus.CREATED, TaskStatus.CONFLICTED] },
      },
      {
        $set: {
          'category.points': points,
        },
      }
    );
    if (!res) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: 'Обновление поинтов задачи не выполнено или выполнено с ошибкой',
      });
    }

    return res;
  }

  public async releaseTask(taskId: string, user: AnyUserInterface) {
    const task = await this.tasksRepo.findById(taskId);
    if (task.status !== TaskStatus.ACCEPTED) {
      throw new ForbiddenException('Нельзя отменить не принятую в работу задачу', {
        cause: `Попытка пользователя с _id '${user._id}' отменить задачу с _id '${taskId}', которая не принята в работу`,
      });
    }
    const { volunteer } = task;
    if (volunteer && volunteer._id !== user._id) {
      throw new ForbiddenException('Нельзя отказаться от чужой задачи', {
        cause: `Попытка волонтёра с _id '${user._id}' отказаться от чужой задачи с _id '${taskId}'`,
      });
    }

    if (!task.date) {
      throw new ForbiddenException('Нельзя отказаться от постоянной/бессрочной задачи', {
        cause: `Попытка пользователя с _id '${user._id}' отказаться от постоянной/бессрочной задачи с _id '${taskId}'`,
      });
    }

    const startDateInMs = task.date.getTime();
    const beforeStartTask = startDateInMs - new Date().getTime();
    if (beforeStartTask / dayInMs <= 1) {
      throw new ForbiddenException('Нельзя отказаться менее, чем за сутки от начала задачи', {
        cause: `Попытка пользователя с _id '${user._id}' отказаться от задачи с _id '${taskId}' менее, чем за сутки до её начала`,
      });
    }

    const query: FilterQuery<Task> = {
      _id: taskId,
    };

    return this.tasksRepo.findOneAndUpdate(query, {
      $set: {
        status: TaskStatus.CREATED,
        volunteer: null,
      },
    });

    // TODO: реализовать закрытие чата при задаче с помощью команды
  }
}
