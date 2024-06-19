import { Global, Module } from '@nestjs/common'
import { JwtAccessStrategy } from '@auth/strategies/jwt-access.strategy'
import { PassportModule } from '@nestjs/passport'
import { CustomerModule } from '@customer/customer.module'
import { AuthService } from '@auth/services/auth.service'
import { AuthCustomerController } from '@auth/controllers/customer.controller'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { JwtRefreshStrategy } from '@auth/strategies/jwt-refresh.strategy'
import { StaffModule } from '@staff/staff.module'
import { AuthProviderController } from '@auth/controllers/provider.controller'

@Global()
@Module({
  imports: [
    ConfigModule,
    CustomerModule,
    StaffModule,
    PassportModule,
    JwtModule
  ],
  controllers: [AuthCustomerController, AuthProviderController],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
  exports: [AuthService]
})
export class AuthModule {}
