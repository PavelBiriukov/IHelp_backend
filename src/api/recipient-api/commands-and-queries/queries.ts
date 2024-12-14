import { Type } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { GetVirginTasksQueryHandler } from '../../../core/get-virgin-tasks.query.handler';

export const QUERIES: Type<IQueryHandler>[] = [GetVirginTasksQueryHandler];
