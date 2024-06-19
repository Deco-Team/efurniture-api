import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AbstractRepository } from '@common/repositories'
import { Staff, StaffDocument } from '@staff/schemas/staff.schema'

@Injectable()
export class StaffRepository extends AbstractRepository<StaffDocument> {
  constructor(@InjectModel(Staff.name) model: PaginateModel<StaffDocument>) {
    super(model)
  }
}
