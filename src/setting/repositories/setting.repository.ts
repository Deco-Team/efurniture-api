import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AbstractRepository } from '@common/repositories'
import { Setting, SettingDocument } from '@setting/schemas/setting.schema'

@Injectable()
export class SettingRepository extends AbstractRepository<SettingDocument> {
  constructor(@InjectModel(Setting.name) model: PaginateModel<SettingDocument>) {
    super(model)
  }
}
