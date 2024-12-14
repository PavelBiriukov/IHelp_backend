/* eslint-disable @typescript-eslint/ban-types */
import { DeleteResult, UpdateResult } from 'mongodb';
import {
  Document,
  FilterQuery,
  Model,
  UpdateQuery,
  type ObjectId,
  MongooseBulkWriteOptions,
  PipelineStage,
  AggregateOptions,
} from 'mongoose';
import { POJOType } from '../../common/types/pojo.type';

export abstract class BaseRepositoryService<T extends Document, M = {}, V = {}> {
  protected constructor(protected readonly entityModel: Model<T, {}, M, V>) {}

  async create(createEntityDto: Record<string, unknown>): Promise<POJOType<T>> {
    const entity = await this.entityModel.create(createEntityDto as T);
    return (await entity.save()).toObject();
  }

  async find(
    query: FilterQuery<T>,
    projection?: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<Array<T>> {
    return this.entityModel.find(
      query,
      {
        ...projection,
      },
      options
    );
  }

  async findOne(
    query: FilterQuery<T>,
    projection?: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<POJOType<T>> {
    const doc = await this.entityModel
      .findOne(
        query,
        {
          ...projection,
        },
        options
      )
      .exec();
    return doc ? doc.toObject() : null;
  }

  async updateOne(
    query: FilterQuery<T>,
    updateDto: UpdateQuery<unknown>,
    options: Record<string, unknown>
  ): Promise<T> {
    const res: UpdateResult = await this.entityModel.updateOne(query, updateDto, options);
    let doc: Document<T> | null = null;
    if (res.acknowledged) {
      doc = (await this.entityModel.findOne(query).exec()) as Document<T>;
    }
    return doc ? doc.toObject() : null;
  }

  async replaceOne(
    query: FilterQuery<T>,
    replaceDoc: T,
    options: Record<string, unknown>
  ): Promise<T> {
    const res: UpdateResult = await this.entityModel.replaceOne(query, replaceDoc, options);
    let doc: Document<T> | null = null;
    if (res.acknowledged) {
      doc = (await this.entityModel.findOne(query).exec()) as Document<T>;
    }
    return doc ? doc.toObject() : null;
  }

  async deleteOne(query: FilterQuery<T>, options: Record<string, unknown>): Promise<DeleteResult> {
    return this.entityModel.deleteOne(query, options);
  }

  async findOneAndUpdate(
    query: FilterQuery<T>,
    updateDto: UpdateQuery<unknown>,
    options?: Record<string, unknown>
  ): Promise<T> {
    const doc: Document<T> = await this.entityModel.findOneAndUpdate(query, updateDto, {
      new: true,
      ...options,
    });
    return doc ? doc.toObject() : null;
  }

  async findOneAndReplace(
    query: FilterQuery<T>,
    replaceDoc: T,
    options: Record<string, unknown>
  ): Promise<T> {
    const doc = await this.entityModel
      .findOneAndReplace(query, replaceDoc, {
        new: true,
        ...options,
      })
      .exec();
    return doc ? doc.toObject() : null;
  }

  async findOneAndDelete(query: FilterQuery<T>, options: Record<string, unknown>): Promise<T> {
    const doc = await this.entityModel.findOneAndDelete(query, options).exec();
    return doc ? doc.toObject() : null;
  }

  async findById(
    id: string | ObjectId,
    projection?: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<T> {
    return this.entityModel.findById(
      id,
      {
        ...projection,
      },
      options
    );
  }

  async findByIdAndUpdate(
    id: string | ObjectId,
    updateDto: UpdateQuery<unknown>,
    options: Record<string, unknown>
  ): Promise<T> {
    const doc = await this.entityModel
      .findByIdAndUpdate(id, updateDto, {
        new: true,
        ...options,
      })
      .exec();
    return doc.toObject();
  }

  async findByIdAndDelete(id: string | ObjectId, options?: Record<string, unknown>): Promise<T> {
    const doc = await this.entityModel.findByIdAndDelete(id, options).exec();
    return doc.toObject();
  }

  async insertMany(docs: Array<T>): Promise<Array<Document<T>>> {
    const insertedDocs = (await this.entityModel.insertMany(docs)) as Array<Document<T>>;
    return !!insertedDocs && insertedDocs.length > 0
      ? insertedDocs.map((doc) => doc.toObject())
      : null;
  }

  async updateMany(
    query: FilterQuery<T>,
    updateDto: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<Array<T>> {
    const res = await this.entityModel.updateMany(query, updateDto, options).exec();
    if (res.acknowledged) {
      return this.entityModel.find(query, {}, options);
    }
    return null;
  }

  async bulkWrite(docs: any, options: Record<string, unknown>): Promise<any> {
    return this.entityModel.bulkWrite(docs, options as MongooseBulkWriteOptions);
  }

  async deleteMany(entityFilterQuery: FilterQuery<T>): Promise<DeleteResult> {
    return this.entityModel.deleteMany(entityFilterQuery);
  }

  async aggregate(pipeline: PipelineStage[], options?: AggregateOptions): Promise<Array<T>> {
    return this.entityModel.aggregate(pipeline, options);
  }
}
