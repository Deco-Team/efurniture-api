import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Setting, SettingSchema } from '@setting/schemas/setting.schema';
import { SettingService } from '@setting/services/setting.service';
import { SettingRepository } from '@setting/repositories/setting.repository';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
  ],
  providers: [SettingService, SettingRepository],
  exports: [SettingService],
})
export class SettingModule {}
