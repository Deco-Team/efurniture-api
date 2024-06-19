import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ErrorResponse, SuccessDataResponse } from '@common/contracts/dto'
import { GoogleLoginReqDto, LoginReqDto } from '@auth/dto/login.dto'
import { AuthService } from '@auth/services/auth.service'
import { TokenResDto } from '@auth/dto/token.dto'
import { UserSide } from '@common/contracts/constant'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { RegisterReqDto } from '@auth/dto/register.dto'
import { DataResponse } from '@common/contracts/openapi-builder'

@ApiTags('Auth - Customer')
@Controller('customer')
export class AuthCustomerController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginReqDto })
  @ApiOkResponse({ type: DataResponse(TokenResDto) })
  @ApiBadRequestResponse({ type: ErrorResponse })
  login(@Body() loginReqDto: LoginReqDto): Promise<TokenResDto> {
    return this.authService.login(loginReqDto, UserSide.CUSTOMER)
  }

  @Post('google')
  @ApiOkResponse({ type: DataResponse(TokenResDto) })
  @ApiBadRequestResponse({ type: ErrorResponse })
  googleLogin(@Body() googleLoginReqDto: GoogleLoginReqDto): Promise<TokenResDto> {
    return this.authService.googleLogin(googleLoginReqDto)
  }

  @Post('register')
  @ApiBody({ type: RegisterReqDto })
  @ApiOkResponse({ type: SuccessDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async register(@Body() registerReqDto: RegisterReqDto) {
    return await this.authService.register(registerReqDto)
  }

  @UseGuards(JwtAuthGuard.REFRESH_TOKEN)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiOkResponse({ type: DataResponse(TokenResDto) })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async refreshToken(@Req() req): Promise<TokenResDto> {
    const res = await this.authService.refreshAccessToken(req.user.id, UserSide.CUSTOMER)

    return res
  }
}
