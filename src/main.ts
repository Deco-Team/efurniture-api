import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { useContainer } from 'class-validator'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppLogger } from '@src/common/services/app-logger.service'
import { TransformInterceptor } from '@common/interceptors/transform.interceptor'
import { AppExceptionFilter } from '@common/exceptions/app-exception.filter'
import { AppValidationPipe } from '@common/pipes/app-validate.pipe'
import { TrimRequestBodyPipe } from '@common/pipes/trim-req-body.pipe'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = app.get(AppLogger)
  app.useLogger(logger)
  app.useGlobalInterceptors(new TransformInterceptor())
  app.useGlobalFilters(new AppExceptionFilter(logger))
  const globalPipes = [new TrimRequestBodyPipe(), new AppValidationPipe()]
  app.useGlobalPipes(...globalPipes)

  // Adding custom validator decorator
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  // add api-docs
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Furnique Swagger')
      .setDescription('Nestjs API documentation')
      .setVersion(process.env.npm_package_version || '1.0.0')
      .addBearerAuth()
      .addBearerAuth(
        {
          type: 'http',
          in: 'header',
          scheme: 'bearer'
        },
        'RefreshToken'
      )
      .addSecurity('bearer', {
        type: 'http',
        scheme: 'bearer'
      })
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  }

  // Example: process.env.CORS_VALID_ORIGINS=localhost,ngrok-free => parse to [ /localhost/, /ngrok-free/ ]
  const origins = process.env.CORS_VALID_ORIGINS.split(',').map((origin) => new RegExp(origin)) || [
    /localhost/,
    /ngrok-free/
  ]
  // app.enableCors({ origin: origins }); // use later
  app.enableCors()

  const port = process.env.PORT || 5000
  await app.listen(port)
  logger.debug(`🚕 ==>> Furnique Server is running on port ${port} <<== 🚖`)
}
bootstrap()
