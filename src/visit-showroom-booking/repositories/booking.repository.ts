import { PaginateModel } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { AbstractRepository } from '@common/repositories'
import { VisitShowroomBooking, VisitShowroomBookingDocument } from '@visit-showroom-booking/schemas/booking.schema'

@Injectable()
export class VisitShowroomBookingRepository extends AbstractRepository<VisitShowroomBookingDocument> {
  constructor(@InjectModel(VisitShowroomBooking.name) model: PaginateModel<VisitShowroomBookingDocument>) {
    super(model)
  }
}
