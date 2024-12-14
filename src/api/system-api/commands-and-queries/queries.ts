import { Type } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { GetPublicTasksQueryHandler } from '../../../core/get-public-tasks.query.handler';

export const QUERIES: Type<IQueryHandler>[] = [GetPublicTasksQueryHandler];
