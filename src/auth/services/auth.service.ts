import { JwtService } from '@nestjs/jwt'
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { GoogleLoginReqDto, LoginReqDto } from '@auth/dto/login.dto'
import { CustomerRepository } from '@customer/repositories/customer.repository'
import { Errors } from '@common/contracts/error'
import { Customer } from '@customer/schemas/customer.schema'
import { UserSide, UserRole, Status } from '@common/contracts/constant'
import * as bcrypt from 'bcrypt'
import { AccessTokenPayload } from '@auth/strategies/jwt-access.strategy'
import { RefreshTokenPayload } from '@auth/strategies/jwt-refresh.strategy'
import { TokenResDto } from '@auth/dto/token.dto'
import { ConfigService } from '@nestjs/config'
import { RegisterReqDto } from '@auth/dto/register.dto'
import { StaffRepository } from '@staff/repositories/staff.repository'
import { Staff } from '@staff/schemas/staff.schema'
import { SuccessResponse } from '@common/contracts/dto'
import { OAuth2Client } from 'google-auth-library'

@Injectable()
export class AuthService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly staffRepository: StaffRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  public async login(loginReqDto: LoginReqDto, side: UserSide): Promise<TokenResDto> {
    let user: Customer | Staff
    let userRole: UserRole
    let providerId: string

    if (side === UserSide.CUSTOMER) {
      user = await this.customerRepository.findOne({
        conditions: {
          email: loginReqDto.email
        }
      })

      userRole = UserRole.CUSTOMER
    }

    if (side === UserSide.PROVIDER) {
      user = await this.staffRepository.findOne({
        conditions: {
          email: loginReqDto.email
        }
      })

      userRole = user?.role
      providerId = user?.providerId.toString()
    }

    if (!user) throw new BadRequestException(Errors.WRONG_EMAIL_OR_PASSWORD.message)

    if (user.status === Status.INACTIVE) throw new BadRequestException(Errors.INACTIVE_ACCOUNT.message)

    const isPasswordMatch = await this.comparePassword(loginReqDto.password, user.password)

    if (!isPasswordMatch) throw new BadRequestException(Errors.WRONG_EMAIL_OR_PASSWORD.message)

    const accessTokenPayload: AccessTokenPayload = { name: user.firstName, sub: user._id, role: userRole, providerId }

    const refreshTokenPayload: RefreshTokenPayload = { sub: user._id, role: userRole }

    const tokens = this.generateTokens(accessTokenPayload, refreshTokenPayload)

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  }

  public async googleLogin(googleLoginReqDto: GoogleLoginReqDto): Promise<TokenResDto> {
    const client = new OAuth2Client({
      clientId: this.configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET')
    })

    const ticket = await client.verifyIdToken({
      idToken: googleLoginReqDto.token
    })

    const payload = ticket.getPayload()

    const googleUserId = payload.sub

    let user = await this.customerRepository.findOne({
      conditions: {
        $or: [{ email: payload.email }, { googleUserId: googleUserId }]
      }
    })

    if (!user) {
      user = await this.customerRepository.create({
        firstName: payload.name,
        email: payload.email,
        avatar: payload.picture,
        googleUserId: googleUserId
      })
    }

    const accessTokenPayload: AccessTokenPayload = { name: user.firstName, sub: user._id, role: UserRole.CUSTOMER }

    const refreshTokenPayload: RefreshTokenPayload = { sub: user._id, role: UserRole.CUSTOMER }

    const tokens = this.generateTokens(accessTokenPayload, refreshTokenPayload)

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  }

  public async register(registerReqDto: RegisterReqDto) {
    const customer = await this.customerRepository.findOne({
      conditions: {
        email: registerReqDto.email
      }
    })

    if (customer) throw new BadRequestException(Errors.EMAIL_ALREADY_EXIST.message)

    const password = await this.hashPassword(registerReqDto.password)

    await this.customerRepository.create({
      firstName: registerReqDto.firstName,
      lastName: registerReqDto.lastName,
      email: registerReqDto.email,
      password
    })

    return new SuccessResponse(true)
  }

  public async refreshAccessToken(id: string, side: UserSide): Promise<TokenResDto> {
    let tokens: TokenResDto

    if (side === UserSide.CUSTOMER) {
      const user = await this.customerRepository.findOne({ conditions: { _id: id } })

      if (!user) throw new UnauthorizedException()

      const accessTokenPayload: AccessTokenPayload = { name: user.firstName, sub: user._id, role: UserRole.CUSTOMER }

      const refreshTokenPayload: RefreshTokenPayload = { sub: user._id, role: UserRole.CUSTOMER }

      tokens = this.generateTokens(accessTokenPayload, refreshTokenPayload)
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(password, salt)
    return hash
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  private generateTokens(accessTokenPayload: AccessTokenPayload, refreshTokenPayload: RefreshTokenPayload) {
    return {
      accessToken: this.jwtService.sign(accessTokenPayload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION')
      }),
      refreshToken: this.jwtService.sign(refreshTokenPayload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION')
      })
    }
  }
}
