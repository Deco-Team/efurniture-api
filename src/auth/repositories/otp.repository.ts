import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { AbstractRepository } from '@common/repositories'
import { Otp, OtpDocument } from '@auth/schema/otp.schema'

@Injectable()
export class OtpRepository extends AbstractRepository<OtpDocument> {
  constructor(@InjectModel(Otp.name) model: PaginateModel<OtpDocument>) {
    super(model)
  }
}
