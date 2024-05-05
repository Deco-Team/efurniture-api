import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger'
import * as _ from 'lodash'

import { ErrorResponse, PaginationQuery } from '@common/contracts/dto'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RolesGuard } from '@auth/guards/roles.guard'
import { OrderStatus, TransactionStatus, UserRole } from '@common/contracts/constant'
import { Roles } from '@auth/decorators/roles.decorator'
import { CreateOrderDto, OrderDto, OrderPaginateResponseDto, PublicOrderHistoryDto } from '@order/dto/order.dto'
import { OrderService } from '@order/services/order.service'
import { OrderHistoryDto } from '@order/schemas/order.schema'
import { Pagination, PaginationParams } from '@common/decorators/pagination.decorator'
import { DataResponse } from '@common/contracts/openapi-builder'
import { CreatePayOSPaymentResponseDto } from '@payment/dto/payos-payment.dto'

@ApiTags('Order - Customer')
@ApiBearerAuth()
@Roles(UserRole.CUSTOMER)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, RolesGuard)
@Controller('customer')
export class OrderCustomerController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new order(orderStatus: PENDING, transactionStatus: DRAFT)'
  })
  @ApiOkResponse({ type: CreatePayOSPaymentResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async createOrder(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    const { _id, role } = _.get(req, 'user')
    createOrderDto.customer._id = _id
    createOrderDto.orderHistory = [new OrderHistoryDto(OrderStatus.PENDING, TransactionStatus.DRAFT, _id, role)]
    const result = await this.orderService.createOrder(createOrderDto)
    return result
  }

  @Get()
  @ApiOperation({
    summary: 'Get customer order list'
  })
  @ApiOkResponse({ type: OrderPaginateResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiQuery({ type: PaginationQuery })
  async getPurchaseHistory(@Req() req, @Pagination() paginationParams: PaginationParams) {
    const customerId = _.get(req, 'user._id')
    return await this.orderService.getOrderList({ 'customer._id': customerId }, paginationParams)
  }

  @Get(':orderId')
  @ApiOperation({
    summary: 'Get a customer order details'
  })
  @ApiOkResponse({ type: DataResponse(OrderDto) })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getPurchaseDetails(@Req() req, @Param('orderId') orderId: string) {
    const customerId = _.get(req, 'user._id')
    return await this.orderService.getOrderDetails({ 'customer._id': customerId, _id: orderId })
  }

  @Get(':orderId/status-history')
  @ApiOperation({
    summary: 'Get a customer order status history'
  })
  @ApiOkResponse({ type: DataResponse(PublicOrderHistoryDto) })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getOrderHistory(@Req() req, @Param('orderId') orderId: string) {
    const { _id: customerId } = _.get(req, 'user')
    const result = await this.orderService.getOrderHistory(customerId, orderId)
    return result
  }
}
