import { Injectable } from '@nestjs/common';
import { SettingRepository } from '@setting/repositories/setting.repository';
import { SettingKey } from '@setting/contracts/constant';

@Injectable()
export class SettingService {
  constructor(readonly settingRepository: SettingRepository) {}

  async getValue(key: SettingKey) {
    return (
      await this.settingRepository.findOne({
        conditions: {
          key: key.toString(),
          enabled: true,
        },
      })
    )?.value;
  }

  async updateValue(key: SettingKey, value: any) {
    return await this.settingRepository.findOneAndUpdate(
      {
        key: key.toString(),
        enabled: true,
      },
      { value },
    );
  }
}
