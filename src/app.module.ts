import { Module } from '@nestjs/common'
import { AcceptLanguageResolver, QueryResolver, HeaderResolver, CookieResolver, I18nModule } from 'nestjs-i18n'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { RouterModule } from '@nestjs/core'
import { MailerModule } from '@nestjs-modules/mailer'
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'

import { AppController } from '@src/app.controller'
import { AppService } from '@src/app.service'
import { join } from 'path'
import configuration from '@src/config'
import { CommonModule } from '@common/common.module'
import { CustomerModule } from '@customer/customer.module'
import { AuthModule } from '@auth/auth.module'
import { ProductModule } from '@product/product.module'
import { CartModule } from '@cart/cart.module'
import { StaffModule } from '@staff/staff.module'
import { CategoryModule } from '@category/category.module'
import { OrderModule } from '@order/order.module'
import { ProviderModule } from '@provider/provider.module'
import { VisitShowroomBookingModule } from '@visit-showroom-booking/booking.module'
import { ConsultantBookingModule } from '@consultant-booking/booking.module'
import { TaskModule } from '@task/task.module'
import { AnalyticModule } from '@analytic/analytic.module'
import { PaymentModule } from '@payment/payment.module'
import { AIGenerationModule } from '@ai-generation/ai-generation.module'
import { ReviewModule } from '@review/review.module'

@Module({
  imports: [
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: 'en',
        loaderOptions: {
          path: join(__dirname, '/i18n/'),
          includeSubfolders: true,
          watch: true
        }
      }),
      resolvers: [
        new QueryResolver(['lang', 'l']),
        new HeaderResolver(['Accept-Language']),
        new CookieResolver(),
        AcceptLanguageResolver
      ],
      inject: [ConfigService]
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodbUrl')
      })
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          port: configService.get('SMTP_PORT'),
          secure: configService.get('SMTP_SECURE'),
          auth: {
            user: configService.get('SMTP_USERNAME'),
            pass: configService.get('SMTP_PASSWORD')
          }
        },
        defaults: {
          from: `"${configService.get('SMTP_FROM_NAME')}" <${configService.get('SMTP_FROM_EMAIL')}>`
        },
        template: {
          dir: join(__dirname, '/templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: false
          }
        }
      }),
      inject: [ConfigService]
    }),
    RouterModule.register([
      {
        path: 'customers',
        module: CustomerModule
      },
      {
        path: 'auth',
        module: AuthModule
      },
      {
        path: 'products',
        module: ProductModule
      },
      {
        path: 'categories',
        module: CategoryModule
      },
      {
        path: 'orders',
        module: OrderModule
      },
      {
        path: 'visit-showroom-bookings',
        module: VisitShowroomBookingModule
      },
      {
        path: 'consultant-bookings',
        module: ConsultantBookingModule
      },
      {
        path: 'ai-generation',
        module: AIGenerationModule
      },
      {
        path: 'reviews',
        module: ReviewModule
      }
    ]),
    CommonModule,
    CustomerModule,
    AuthModule,
    ProductModule,
    CartModule,
    StaffModule,
    CategoryModule,
    OrderModule,
    ProviderModule,
    VisitShowroomBookingModule,
    ConsultantBookingModule,
    TaskModule,
    AnalyticModule,
    PaymentModule,
    AIGenerationModule,
    ReviewModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
