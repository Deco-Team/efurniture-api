import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { UserRole } from '@src/common/contracts/constant'
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(configService: ConfigService) {
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')
    }
    super(opts)
  }

  validate(payload: AccessTokenPayload) {
    return { _id: payload.sub, name: payload.name, role: payload.role, providerId: payload.providerId }
  }
}

export type AccessTokenPayload = {
  name: string
  sub: string
  role: UserRole
  providerId?: string
  iat?: number
  exp?: number
}
