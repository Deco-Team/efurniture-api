import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DataResponse, PaginateResponse } from '@src/common/contracts/openapi-builder'
import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional, MaxLength } from 'class-validator'
import { Priority, TaskStatus, TaskType } from '@src/common/contracts/constant'
import { Task } from '@task/schemas/task.schema'

export class CreateTaskDto {
  @ApiProperty({ example: 'Giao hàng' })
  @IsNotEmpty()
  @MaxLength(30)
  title: string

  @ApiProperty({ example: 'Thông tin, địa chỉ, mô tả...' })
  @IsNotEmpty()
  @MaxLength(1000)
  description: string

  @ApiProperty()
  @IsDateString()
  startDate: Date

  @ApiProperty()
  @IsDateString()
  dueDate: Date

  @ApiProperty({ example: 'HIGH | MEDIUM | LOW' })
  @IsNotEmpty()
  @IsEnum(Priority)
  priority: Priority

  reporterId?: string
}

export class CreateShippingTaskDto extends CreateTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  assigneeId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  orderId: string
}

export class TaskPaginateResponseDto extends DataResponse(
  class TaskPaginateResponse extends PaginateResponse(Task) {}
) {}

export class TaskResponseDto extends DataResponse(Task) {}

export class FilterTaskDto {
  @ApiPropertyOptional({
    enum: TaskType,
  })
  @IsOptional()
  @IsEnum(TaskType)
  type: TaskType;

  @ApiPropertyOptional({
    enum: Priority,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority: Priority;

  @ApiPropertyOptional({
    enum: TaskStatus,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status: TaskStatus;
}