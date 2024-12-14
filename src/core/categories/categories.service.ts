import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UpdatePointsInTasksCommand } from '../../common/commands-and-queries/update-points.command';
import { ApiUpdateCategoryDto } from '../../api/admin-api/dto/update-category.dto';
import { ApiBulkUpdateCategoriesDto } from '../../api/admin-api/dto/bulk-update-categories.dto';
import exceptions from '../../common/constants/exceptions';
import { CreateCategoryDto } from '../../common/dto/category.dto';
import { AdminPermission, AdminInterface } from '../../common/types/user.types';
import { checkIsEnoughRights } from '../../common/helpers/checkIsEnoughRights';
import { CategoryRepository } from '../../datalake/category/category.repository';
// import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepo: CategoryRepository,
    // private readonly tasksService: TasksService,
    private readonly commandBus: CommandBus
  ) {}

  async getCategories() {
    return this.categoriesRepo.find({});
  }

  // TODO вынести общую часть про castError отдельно
  async getCategoryById(id: string) {
    let category;

    try {
      category = await this.categoriesRepo.findById(id);
    } catch (err) {
      throw new InternalServerErrorException(exceptions.category.internalError, {
        cause: `Ошибка в методе поиска категории findById: ${err}`,
      });
    }

    if (!category) {
      throw new NotFoundException(exceptions.category.notFound);
    }

    return category;
  }

  // Только root
  async removeCategory(id: string, user: AdminInterface) {
    if (!checkIsEnoughRights(user, [], true)) {
      throw new ForbiddenException(exceptions.category.notEnoughRights);
    }

    let res;
    try {
      res = await this.categoriesRepo.deleteOne({ _id: id }, {});
    } catch (err) {
      throw new InternalServerErrorException(exceptions.category.internalError, {
        cause: `Ошибка в методе удаления категории deleteOne: ${err}`,
      });
    }

    if (!res.deletedCount) {
      throw new InternalServerErrorException(exceptions.category.nothingToDelete);
    }
    return res;
  }

  // Только админы с правами AdminPermission.CATEGORIES
  async updateCategoriesByIds(dto: ApiBulkUpdateCategoriesDto, user: AdminInterface) {
    if (!checkIsEnoughRights(user, [AdminPermission.CATEGORIES])) {
      throw new ForbiddenException(exceptions.category.notEnoughRights);
    }

    let res;
    const bulkUpdateArr = dto.data.map((item) => {
      const { id, ...data } = item;
      const operation = {
        updateOne: {
          filter: { _id: id },
          update: { ...data },
        },
      };
      return operation;
    });

    try {
      res = await this.categoriesRepo.bulkWrite(bulkUpdateArr, { ordered: false });

      dto.data.map(async (item) => {
        const { id, points } = item;
        if (points) {
          // await this.tasksService.updateTaskPoints(points, id);

          await this.commandBus.execute(new UpdatePointsInTasksCommand({ points, id }));
        }
      });
    } catch (err) {
      throw new InternalServerErrorException(exceptions.category.internalError, {
        cause: `Ошибка в методе массового обновления категорий updateCategoriesByIds: ${err}`,
      });
    }

    return res;
  }

  // Только админы с правами AdminPermission.CATEGORIES
  async updateCategoryById(id: string, updateData: ApiUpdateCategoryDto, user: AdminInterface) {
    if (!checkIsEnoughRights(user, [AdminPermission.CATEGORIES])) {
      throw new ForbiddenException(exceptions.category.notEnoughRights);
    }

    let res;
    try {
      res = await this.categoriesRepo.findOneAndUpdate({ _id: id }, updateData, { new: true });

      if (!res) throw new NotFoundException(exceptions.category.notFound);

      const { points } = updateData;

      // await this.tasksService.updateTaskPoints(updateData.points, id);

      await this.commandBus.execute(new UpdatePointsInTasksCommand({ points, id }));
    } catch (err) {
      throw new InternalServerErrorException(exceptions.category.internalError, {
        cause: `Ошибка в методе обновления данных категории findOneAndUpdate: ${err}`,
      });
    }
    if (!res) throw new NotFoundException(exceptions.category.notFound);

    return res;
  }

  // Только root
  async createCategory(data: CreateCategoryDto, user: AdminInterface) {
    if (!checkIsEnoughRights(user, [], true)) {
      throw new ForbiddenException(exceptions.category.notEnoughRights);
    }

    return this.categoriesRepo.create(data);
  }

  // Только для админов с правами AdminPermission.CATEGORIES
  async updatePoints(data: Record<string, number>, user: AdminInterface) {
    if (!checkIsEnoughRights(user, [AdminPermission.CATEGORIES])) {
      throw new ForbiddenException(exceptions.category.notEnoughRights);
    }

    const res = await Promise.allSettled(
      Object.keys(data).map(
        (id) => this.categoriesRepo.findByIdAndUpdate(id, { points: data[id] }, {}),
        this
      )
    ).catch((err) => {
      throw new InternalServerErrorException(err.message);
    });

    return res;
  }
}
