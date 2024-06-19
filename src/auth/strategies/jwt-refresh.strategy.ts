import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { UserRole } from '@src/common/contracts/constant'
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')
    }
    super(opts)
  }

  validate(payload: RefreshTokenPayload) {
    return { _id: payload.sub, role: payload.role }
  }
}

export type RefreshTokenPayload = {
  sub: string
  role: UserRole
  iat?: number
  exp?: number
}
