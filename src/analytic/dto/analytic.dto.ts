import { AnalyticPeriod } from '@common/contracts/constant'
import { ApiProperty } from '@nestjs/swagger'
import { DataResponse } from '@src/common/contracts/openapi-builder'
import { Type } from 'class-transformer'
import { IsEnum, IsNumber, Max, Min } from 'class-validator'

export class QueryCurrentAnalyticDto {
  @ApiProperty({
    enum: AnalyticPeriod
  })
  @IsEnum(AnalyticPeriod)
  periodType: AnalyticPeriod
}

export class CurrentAnalyticDto {
  @ApiProperty()
  previousTotal: number

  @ApiProperty()
  total: number

  @ApiProperty()
  percent: number
}

export class CurrentAnalyticResponseDto extends DataResponse(CurrentAnalyticDto) {}

export class QueryStatisticAnalyticDto {
  @ApiProperty({
    type: Number,
    example: 2024
  })
  @Type(() => Number)
  @IsNumber()
  @Max(2050)
  @Min(2020)
  year: number
}

export class StatisticAnalyticDto {
  statistic: number[]
}

export class StatisticAnalyticResponseDto extends DataResponse(StatisticAnalyticDto) {}
