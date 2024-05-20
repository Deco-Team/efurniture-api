import { Injectable, Logger } from '@nestjs/common'
import { AIGenerationRepository } from '@ai-generation/repositories/ai-generation.repository'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { catchError, firstValueFrom } from 'rxjs'
import { AxiosError } from 'axios'
import { GenerateTextToDraftModelDto } from '@ai-generation/dtos/text-to-model.dto'
import { AppException } from '@common/exceptions/app.exception'
import { Errors } from '@common/contracts/error'
import { AIGenerationType } from '@ai-generation/contracts/constant'

@Injectable()
export class AIGenerationTextToModelService {
  private readonly logger = new Logger(AIGenerationTextToModelService.name)
  private config
  private headersRequest
  constructor(
    private readonly aiGenerationRepository: AIGenerationRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.config = this.configService.get('tripo3dAI')
    this.headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`
    }
  }

  async generateTextToDraftModel(generateTextToDraftModelDto: GenerateTextToDraftModelDto) {
    const {customerId} = generateTextToDraftModelDto

    // TODO: Check limit AI generation here

    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.config.endpoint}/v2/openapi/task`, generateTextToDraftModelDto, {
          headers: this.headersRequest
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data)
            throw new AppException({ ...Errors.TRIPO_3D_AI_ERROR, data: error?.response?.data })
          })
        )
    )
    if (data.code !== 0) throw new AppException({ ...Errors.TRIPO_3D_AI_ERROR, data })

    await this.aiGenerationRepository.create({
      customerId,
      type: AIGenerationType.TEXT_TO_MODEL,
      taskId: data?.data?.task_id
    })

    return data?.data
  }

  async getTask(taskId: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.config.endpoint}/v2/openapi/task/${taskId}`, { headers: this.headersRequest }).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response.data)
          throw new AppException({ ...Errors.TRIPO_3D_AI_ERROR, data: error?.response?.data })
        })
      )
    )
    if (data.code !== 0) throw new AppException({ ...Errors.TRIPO_3D_AI_ERROR, data })
    return data?.data
  }
}
