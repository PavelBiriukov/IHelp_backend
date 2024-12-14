import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { AdminApiController } from './admin-api.controller';
import { UsersService } from '../../core/users/users.service';
import { TasksService } from '../../core/tasks/tasks.service';
import { BlogService } from '../../core/blog/blog.service';
import { CategoriesService } from '../../core/categories/categories.service';
import { ContactsService } from '../../core/contacts/contacts.service';
import { TaskStatus } from '../../common/types/task.types';

const userIdMock = '6660147b30646b68ad1b41fb';

const userDataMock = {
  _id: '6660147b30646b68ad1b41fb',
  address: 'Oxford',
  name: 'Lyra Silvertongue',
  role: 'Volunteer',
};

describe('AdminApiController', () => {
  let adminApiController: AdminApiController;
  let usersService: Pick<jest.MockedObject<UsersService>, 'getProfile'>;
  let tasksService: Pick<jest.MockedObject<TasksService>, 'getOwnTasks'>;
  // Раскомментировать по мере надобности при написании новых тестов:
  // let blogService: Pick<jest.MockedObject<BlogService>, 'create'>;
  // let categoriesService: Pick<jest.MockedObject<CategoriesService>, 'createCategory'>;
  // let contactsService: Pick<jest.MockedObject<ContactsService>, 'update'>;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AdminApiController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getProfile: jest.fn(() => {
              return Promise.resolve(userDataMock);
            }),
          },
        },
        {
          provide: TasksService,
          useValue: {
            getOwnTasks: jest.fn(),
          },
        },
        {
          provide: BlogService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            createCategory: jest.fn(),
          },
        },
        {
          provide: ContactsService,
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    adminApiController = moduleRef.get(AdminApiController);
    usersService = moduleRef.get(UsersService);
    tasksService = moduleRef.get(TasksService);
    // Раскомментировать по мере надобности при написании новых тестов:
    // blogService = moduleRef.get(BlogService);
    // categoriesService = moduleRef.get(CategoriesService);
    // contactsService = moduleRef.get(ContactsService);
  });

  describe('getTasks()', () => {
    it('should call getProfile method of the usersService with correct argument', () => {
      jest.spyOn(usersService, 'getProfile');
      adminApiController.getTasks(userIdMock);
      expect(usersService.getProfile).toHaveBeenCalledWith(userIdMock);
    });

    it('should call getOwnTasks method of the tasksService with correct arguments', () => {
      jest.spyOn(tasksService, 'getOwnTasks');
      adminApiController.getTasks(userIdMock);
      expect(tasksService.getOwnTasks).toHaveBeenCalledWith(userDataMock, TaskStatus.ACCEPTED);
      expect(tasksService.getOwnTasks).toHaveBeenCalledWith(userDataMock, TaskStatus.COMPLETED);
      expect(tasksService.getOwnTasks).toHaveBeenCalledWith(userDataMock, TaskStatus.CONFLICTED);
      expect(tasksService.getOwnTasks).toHaveBeenCalledWith(userDataMock, TaskStatus.CREATED);
    });
  });
});
