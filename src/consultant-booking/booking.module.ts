import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CategoryModule } from '@category/category.module'
import { StaffModule } from '@staff/staff.module'
import { ConsultantBooking, ConsultantBookingSchema } from '@consultant-booking/schemas/booking.schema'
import { ConsultantBookingCustomerController } from '@consultant-booking/controllers/customer.controller'
import { ConsultantBookingService } from '@consultant-booking/services/booking.service'
import { ConsultantBookingRepository } from '@consultant-booking/repositories/booking.repository'
import { ConsultantBookingProviderController } from '@consultant-booking/controllers/provider.controller'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ConsultantBooking.name, schema: ConsultantBookingSchema }]),
    CategoryModule,
    StaffModule
  ],
  controllers: [ConsultantBookingCustomerController, ConsultantBookingProviderController],
  providers: [ConsultantBookingService, ConsultantBookingRepository],
  exports: [ConsultantBookingService]
})
export class ConsultantBookingModule {}
