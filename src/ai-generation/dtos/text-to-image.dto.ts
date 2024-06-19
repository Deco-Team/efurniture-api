import { ApiProperty } from '@nestjs/swagger'
import { DataResponse } from '@common/contracts/openapi-builder'
import { IsNotEmpty, MaxLength } from 'class-validator'

export class GenerateTextToImageDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(1024)
  text: string

  providers?: string[]
  resolution?: string
  customerId?: string
}

export class TextToImageDto {
  @ApiProperty({
    example: 'https://d14uq1pz7dzsdq.cloudfront.net/79926ef2-c82f-4352-9e94-a394c871846a_.png'
  })
  imageUrl: string
}

export class TextToImageResponseDto extends DataResponse(TextToImageDto) {}