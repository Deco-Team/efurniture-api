import { Injectable, Logger } from '@nestjs/common'
import { AIGenerationRepository } from '@ai-generation/repositories/ai-generation.repository'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { catchError, firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { AIGenerationPlatform, AIGenerationPricing, AIGenerationType } from '@ai-generation/contracts/constant'
import { GenerateTextToImageDto } from '@ai-generation/dtos/text-to-image.dto'
import { CustomerRepository } from '@customer/repositories/customer.repository'
import { Status } from '@common/contracts/constant'

@Injectable()
export class AIGenerationTextToImageService {
  private readonly logger = new Logger(AIGenerationTextToImageService.name)
  private config
  private headersRequest
  constructor(
    private readonly aiGenerationRepository: AIGenerationRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly customerRepository: CustomerRepository
  ) {
    this.config = this.configService.get('edenAI')
    this.headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`
    }
  }

  async generateTextToImage(generateTextToImageDto: GenerateTextToImageDto) {
    const { customerId } = generateTextToImageDto

    // Check limit AI generation
    const { credits } = await this.customerRepository.findOne({
      conditions: {
        _id: customerId,
        status: Status.ACTIVE
      }
    })
    if (credits < AIGenerationPricing.TEXT_TO_IMAGE) {
      throw new AppException(Errors.NOT_ENOUGH_CREDITS_ERROR)
    }

    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.config.endpoint}/v2/image/generation`, generateTextToImageDto, {
          headers: this.headersRequest
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error?.response?.data)
            throw new AppException({ ...Errors.EDEN_AI_ERROR, data: error?.response?.data })
          })
        )
    )
    const result: any = Object.values(data)[0]
    if (result?.status !== 'success') throw new AppException({ ...Errors.EDEN_AI_ERROR, data })

    const imageUrl = result?.items[0]?.image_resource_url
    await Promise.all([
      this.aiGenerationRepository.create({
        customerId,
        type: AIGenerationType.TEXT_TO_IMAGE,
        platform: AIGenerationPlatform.EDEN_AI,
        cost: result?.cost ?? 0.01, // total 1 credits
        imageUrl
      }),
      this.customerRepository.findOneAndUpdate(
        { _id: customerId },
        {
          $inc: { credits: -AIGenerationPricing.TEXT_TO_IMAGE }
        }
      )
    ])
    return { imageUrl }
  }
}
