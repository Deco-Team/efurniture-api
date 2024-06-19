import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger'
import { DataResponse, PaginateResponse } from '@src/common/contracts/openapi-builder'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsUrl, MaxLength } from 'class-validator'
import { StaffRole, Status, UserRole } from '@src/common/contracts/constant'
import { Staff } from '@staff/schemas/staff.schema'
import { Types } from 'mongoose'

export class CreateStaffDto {
  @ApiProperty({ example: 'Staff' })
  @IsNotEmpty()
  @MaxLength(30)
  firstName: string

  @ApiProperty({ example: 'Name' })
  @IsNotEmpty()
  @MaxLength(30)
  lastName: string

  @ApiProperty({ example: 'EF123456' })
  @IsNotEmpty()
  @MaxLength(30)
  staffCode: string

  @ApiProperty({ example: '0987654321' })
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone: string

  @ApiProperty({ example: 'https://i.stack.imgur.com/l60Hf.png' })
  @IsNotEmpty()
  @IsUrl()
  avatar: string

  @ApiProperty({ example: 'staff@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({ example: 'STAFF | DELIVERY_STAFF | CONSULTANT_STAFF' })
  @IsNotEmpty()
  @IsEnum(StaffRole)
  role: StaffRole

  password?: string
  providerId?: Types.ObjectId
  createdBy?: string
}

export class UpdateStaffDto extends PickType(PartialType(CreateStaffDto), [
  'firstName',
  'lastName',
  'phone',
  'avatar'
]) {}

export class StaffDto {
  @ApiProperty()
  _id: string

  @ApiProperty()
  firstName: string

  @ApiProperty()
  lastName: string

  @ApiProperty()
  email: string

  @ApiProperty()
  staffCode: string

  @ApiProperty()
  phone: string

  @ApiProperty()
  avatar: string

  @ApiProperty()
  role: UserRole

  @ApiProperty()
  status: Status

  @ApiProperty()
  providerId: string

  @ApiProperty()
  createdBy: string
}

export class StaffPaginateResponseDto extends DataResponse(
  class StaffPaginateResponse extends PaginateResponse(Staff) {}
) {}

export class StaffResponseDto extends DataResponse(Staff) {}

export class FilterStaffDto {
  @ApiPropertyOptional({
    enum: StaffRole,
  })
  @IsOptional()
  @IsEnum(StaffRole)
  role: StaffRole;
}