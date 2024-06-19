import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProviderModule } from '@provider/provider.module'
import { StaffRepository } from '@staff/repositories/staff.repository'
import { Staff, StaffSchema } from '@staff/schemas/staff.schema'
import { StaffController } from '@staff/controllers/staff.controller'
import { StaffService } from '@staff/services/staff.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]), ProviderModule],
  controllers: [StaffController],
  providers: [StaffService, StaffRepository],
  exports: [StaffService, StaffRepository]
})
export class StaffModule {}
