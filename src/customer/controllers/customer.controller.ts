import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'

import { CustomerService } from '@customer/services/customer.service'
import { Customer } from '@customer/schemas/customer.schema'
import { ErrorResponse } from '@common/contracts/dto'
import { Roles } from '@auth/decorators/roles.decorator'
import { UserRole } from '@common/contracts/constant'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RolesGuard } from '@auth/guards/roles.guard'
import { CustomerResponseDto } from '@customer/dto/customer.dto'

@ApiTags('Customer')
@ApiBearerAuth()
@Roles(UserRole.CUSTOMER)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, RolesGuard)
@Controller()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}
  
  @ApiOperation({
    summary: 'Get customer information'
  })
  @Get('me')
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiOkResponse({ type: CustomerResponseDto })
  getOwnInformation(@Req() req) {
    const { _id } = _.get(req, 'user')
    return this.customerService.getCustomerDetail(_id)
  }
}
