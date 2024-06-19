import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { VisitShowroomBooking, VisitShowroomBookingSchema } from '@visit-showroom-booking/schemas/booking.schema'
import { CategoryModule } from '@category/category.module'
import { VisitShowroomBookingCustomerController } from '@visit-showroom-booking/controllers/customer.controller'
import { VisitShowroomBookingService } from '@visit-showroom-booking/services/booking.service'
import { VisitShowroomBookingRepository } from '@visit-showroom-booking/repositories/booking.repository'
import { CustomerModule } from '@customer/customer.module'
import { VisitShowroomBookingProviderController } from './controllers/provider.controller'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VisitShowroomBooking.name, schema: VisitShowroomBookingSchema }]),
    CategoryModule,
    CustomerModule
  ],
  controllers: [VisitShowroomBookingCustomerController, VisitShowroomBookingProviderController],
  providers: [VisitShowroomBookingService, VisitShowroomBookingRepository],
  exports: [VisitShowroomBookingService]
})
export class VisitShowroomBookingModule {}
