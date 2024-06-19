import { Injectable, Logger } from '@nestjs/common'
import { AIGenerationRepository } from '@ai-generation/repositories/ai-generation.repository'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { catchError, firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { GenerateTextToDraftModelDto } from '@ai-generation/dtos/text-to-model.dto'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { AIGenerationPlatform, AIGenerationPricing, AIGenerationType } from '@ai-generation/contracts/constant'
import { CustomerRepository } from '@customer/repositories/customer.repository'
import { Status } from '@common/contracts/constant'
import { SettingService } from '@setting/services/setting.service'
import { SettingKey } from '@setting/contracts/constant'

@Injectable()
export class AIGenerationTextToModelService {
  private readonly logger = new Logger(AIGenerationTextToModelService.name)
  private config
  private headersRequest
  constructor(
    private readonly aiGenerationRepository: AIGenerationRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly customerRepository: CustomerRepository,
    private readonly settingService: SettingService
  ) {
    this.config = this.configService.get('tripo3dAI')
    this.headersRequest = {
      'Content-Type': 'application/json'
    }
  }

  async generateTextToDraftModel(generateTextToDraftModelDto: GenerateTextToDraftModelDto) {
    const { customerId } = generateTextToDraftModelDto

    // 1. Check limit AI generation
    const { credits } = await this.customerRepository.findOne({
      conditions: {
        _id: customerId,
        status: Status.ACTIVE
      }
    })
    if (credits < AIGenerationPricing.TEXT_TO_MODEL) {
      throw new AppException(Errors.NOT_ENOUGH_CREDITS_ERROR)
    }

    // 2. Get API_KEY from DB
    const settingValue = await this.settingService.getValue(SettingKey.TRIPO_3D_AI)

    // 3. Run GenAI
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.config.endpoint}/v2/openapi/task`, generateTextToDraftModelDto, {
          headers: { ...this.headersRequest, Authorization: `Bearer ${settingValue['apiKey']}` }
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error?.response?.data)
            throw new AppException({ ...Errors.TRIPO_3D_AI_ERROR, data: error?.response?.data })
          })
        )
    )
    if (data.code !== 0) throw new AppException({ ...Errors.TRIPO_3D_AI_ERROR, data })

    // 4. Save GenAI data, update credits
    await Promise.all([
      this.aiGenerationRepository.create({
        customerId,
        type: AIGenerationType.TEXT_TO_MODEL,
        platform: AIGenerationPlatform.TRIPO_3D_AI,
        cost: 20, // total 2000 credits
        taskId: data?.data?.task_id
      }),
      this.customerRepository.findOneAndUpdate(
        { _id: customerId },
        {
          $inc: { credits: -AIGenerationPricing.TEXT_TO_MODEL }
        }
      )
    ])

    return data?.data
  }

  async getTask(taskId: string) {
    const settingValue = await this.settingService.getValue(SettingKey.TRIPO_3D_AI)

    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.config.endpoint}/v2/openapi/task/${taskId}`, {
          headers: { ...this.headersRequest, Authorization: `Bearer ${settingValue['apiKey']}` }
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error?.response?.data)
            throw new AppException({ ...Errors.TRIPO_3D_AI_ERROR, data: error?.response?.data })
          })
        )
    )
    if (data.code !== 0) throw new AppException({ ...Errors.TRIPO_3D_AI_ERROR, data })
    return data?.data
  }
}
