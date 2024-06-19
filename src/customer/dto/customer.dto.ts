import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { DataResponse } from '@common/contracts/openapi-builder'
import { Customer } from '@customer/schemas/customer.schema'

export class CustomerResponseDto extends DataResponse(Customer) {}

export class CreateCustomerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(30)
  name: string

  @ApiProperty()
  @IsNotEmpty()
  //@IsPhoneNumber()
  phone: string
}
