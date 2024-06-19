import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AbstractRepository } from '@common/repositories'
import { Task, TaskDocument } from '@task/schemas/task.schema'

@Injectable()
export class TaskRepository extends AbstractRepository<TaskDocument> {
  constructor(@InjectModel(Task.name) model: PaginateModel<TaskDocument>) {
    super(model)
  }
}
