import { Body, Controller, Post } from "@nestjs/common"
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { UserSide } from "@common/contracts/constant"
import { ErrorResponse } from "@common/contracts/dto"
import { LoginReqDto } from "@auth/dto/login.dto"
import { TokenResDto } from "@auth/dto/token.dto"
import { AuthService } from "@auth/services/auth.service"
import { DataResponse } from "@common/contracts/openapi-builder"

@ApiTags('Auth - Provider')
@Controller('provider')
export class AuthProviderController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginReqDto })
  @ApiOkResponse({ type: DataResponse(TokenResDto) })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async login(@Body() loginReqDto: LoginReqDto): Promise<TokenResDto> {
    return await this.authService.login(loginReqDto, UserSide.PROVIDER)
  }
}