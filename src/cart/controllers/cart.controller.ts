import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import * as _ from 'lodash'

import { ErrorResponse, SuccessDataResponse } from '@common/contracts/dto'
import { CartService } from '@cart/services/cart.service'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RolesGuard } from '@auth/guards/roles.guard'
import { UserRole } from '@common/contracts/constant'
import { Roles } from '@auth/decorators/roles.decorator'
import { AddToCartDto, UpdateCartDto, DeleteItemInCartDto, CartResponseDto } from '@cart/dto/cart.dto'

@ApiTags('Cart')
@ApiBearerAuth()
@Roles(UserRole.CUSTOMER)
@UseGuards(JwtAuthGuard.ACCESS_TOKEN, RolesGuard)
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({
    summary: 'Add product to cart'
  })
  @ApiOkResponse({ type: SuccessDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async addToCart(@Req() req, @Body() addToCartDto: AddToCartDto) {
    addToCartDto.customerId = _.get(req, 'user._id')
    const result = await this.cartService.addToCart(addToCartDto)
    return result
  }

  @Get()
  @ApiOperation({
    summary: 'Get customer cart'
  })
  @ApiOkResponse({ type: CartResponseDto })
  async getCart(@Req() req) {
    const customerId = _.get(req, 'user._id')
    return await this.cartService.getCart(customerId)
  }
  
  @Patch()
  @ApiOperation({
    summary: 'Update product quantity in cart'
  })
  @ApiOkResponse({ type: SuccessDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async updateCart(@Req() req, @Body() updateCartDto: UpdateCartDto) {
    updateCartDto.customerId = _.get(req, 'user._id')
    const result = await this.cartService.updateCart(updateCartDto)
    return result
  }

  @Delete()
  @ApiOperation({
    summary: 'Remove item in cart'
  })
  @ApiOkResponse({ type: SuccessDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async deleteItemInCart(@Req() req, @Body() deleteItemInCartDto: DeleteItemInCartDto) {
    deleteItemInCartDto.customerId = _.get(req, 'user._id')
    return await this.cartService.deleteItemInCart(deleteItemInCartDto)
  }
}
