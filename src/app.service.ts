import { Injectable } from '@nestjs/common'
import { I18nService } from 'nestjs-i18n'

@Injectable()
export class AppService {
  constructor(private readonly i18nService: I18nService) {}

  getHello(): string {
    return 'Welcome to Furnique!'
  }

  getI18nText(): string {
    return this.i18nService.t('auth.welcome', {
      lang: 'vn'
    })
  }
}
