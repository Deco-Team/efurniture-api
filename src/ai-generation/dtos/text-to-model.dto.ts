import { ApiProperty } from '@nestjs/swagger'
import { DataResponse } from '@common/contracts/openapi-builder'
import { IsNotEmpty, MaxLength } from 'class-validator'
import { AIGenerationTaskProgress, AIGenerationTaskStatus } from '@ai-generation/contracts/constant'

export class GenerateTextToDraftModelDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(1024)
  prompt: string

  // @ApiProperty()
  // @IsNotEmpty()
  // @MaxLength(255)
  // negative_prompt?: string

  type?: string
  customerId?: string
}

export class TextToDraftModelDto {
  @ApiProperty({
    example: '1ec04ced-4b87-44f6-a296-beee80777941'
  })
  task_id: string
}

export class TextToDraftModelResponseDto extends DataResponse(TextToDraftModelDto) {}


export class TextToModelTaskDto {
  @ApiProperty()
  task_id: string

  @ApiProperty()
  type: string

  @ApiProperty({ enum: AIGenerationTaskStatus })
  status: AIGenerationTaskStatus

  @ApiProperty()
  input: object

  @ApiProperty({
    example: {
      model: 'model url',
      rendered_image: 'preview image'
    }
  })
  output: {
    model: string
    rendered_image: string
  }

  @ApiProperty({
    enum: AIGenerationTaskProgress
  })
  progress: AIGenerationTaskProgress

  @ApiProperty()
  create_time: string
}

export class TextToModelTaskResponseDto extends DataResponse(TextToModelTaskDto) {}
