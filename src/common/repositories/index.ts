/// <reference types="mongoose-paginate-v2" />
import {
  Document,
  QueryOptions,
  SaveOptions,
  FilterQuery,
  UpdateQuery,
  PaginateModel,
  PaginateOptions,
  IfAny,
  Require_id,
  UpdateWriteOpResult,
  MongooseQueryOptions
} from 'mongoose'
import { AppException, ErrorResponse } from '@common/exceptions/app.exception'
import { PopulateOptions } from 'mongoose'
import { Errors } from '@common/contracts/error'

export abstract class AbstractRepository<T extends Document> {
  model: PaginateModel<T>
  constructor(model: PaginateModel<T>) {
    this.model = model
  }

  findOne({
    conditions,
    projection,
    populates,
    options
  }: {
    conditions: FilterQuery<T>
    projection?: Record<string, any> | string
    populates?: Array<PopulateOptions>
    options?: QueryOptions
  }): Promise<T | undefined> {
    const query = this.model.findOne(conditions, projection, options)
    query.populate(populates)
    return query.exec()
  }

  async firstOrFail({
    conditions,
    projection,
    options,
    populates,
    error
  }: {
    conditions: FilterQuery<T>
    projection?: Record<string, any> | string
    populates?: Array<PopulateOptions>
    options?: QueryOptions
    error?: ErrorResponse
  }): Promise<T> {
    const entity = await this.findOne({
      conditions,
      projection,
      populates,
      options
    })
    if (entity) {
      return entity
    }
    if (!error) {
      error = Errors.OBJECT_NOT_FOUND
    }
    throw new AppException(error)
  }

  findMany({
    conditions,
    projection,
    populates,
    sort,
    options
  }: {
    conditions: FilterQuery<T>
    projection?: Record<string, any>
    populates?: Array<PopulateOptions>
    sort?: Record<string, any>
    options?: QueryOptions
  }): Promise<Array<T>> {
    const query = this.model.find(conditions, projection, options)
    query.populate(populates)
    if (sort) {
      query.sort(sort)
    }
    return query.exec()
  }

  paginate(
    conditions: FilterQuery<T>,
    options?: PaginateOptions
  ): Promise<
    import('mongoose').PaginateResult<
      import('mongoose').IfAny<
        T,
        any,
        Document<unknown, PaginateOptions, T> & Omit<import('mongoose').Require_id<T>, never>
      >
    >
  > {
    return this.model.paginate(conditions, options)
  }

  async create(payload: Record<string, any>, options?: SaveOptions | undefined): Promise<T> {
    const entity = new this.model(payload)
    await entity.save(options)
    return entity
  }

  async updateOneOrFail(conditions: FilterQuery<T>, payload: object, options?: SaveOptions): Promise<T> {
    const data = await this.firstOrFail({ conditions })
    data.set(payload)
    return data.save(options)
  }

  findOneAndUpdate(
    conditions: FilterQuery<T>,
    payload: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<
    import('mongoose').IfAny<T, any, Document<unknown, {}, T> & Omit<import('mongoose').Require_id<T>, never>>
  > {
    return this.model.findOneAndUpdate(conditions, payload, options).exec()
  }

  updateMany(
    conditions: FilterQuery<T>,
    payload: UpdateQuery<T>,
    options?: (import('mongodb').UpdateOptions & Omit<MongooseQueryOptions<T>, 'lean'>) | null
  ): Promise<UpdateWriteOpResult> {
    return this.model.updateMany(conditions, payload, options).exec()
  }

  findOneAndDelete(
    conditions: FilterQuery<T>,
    options?: QueryOptions
  ): Promise<IfAny<T, any, Document<unknown, {}, T> & Omit<Require_id<T>, never>>> {
    return this.model.findOneAndDelete(conditions, options).exec()
  }

  deleteMany(
    conditions: FilterQuery<T>,
    options?: (import('mongodb').DeleteOptions & Omit<MongooseQueryOptions<T>, 'lean' | 'timestamps'>) | null
  ): Promise<import('mongodb').DeleteResult> {
    return this.model.deleteMany(conditions, options).exec()
  }
}
