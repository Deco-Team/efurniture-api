import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { AbstractRepository } from '@common/repositories'
import { ConsultantBooking, ConsultantBookingDocument } from '@consultant-booking/schemas/booking.schema'

@Injectable()
export class ConsultantBookingRepository extends AbstractRepository<ConsultantBookingDocument> {
  constructor(@InjectModel(ConsultantBooking.name) model: PaginateModel<ConsultantBookingDocument>) {
    super(model)
  }
}
