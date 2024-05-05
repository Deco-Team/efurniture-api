import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { useContainer } from 'class-validator'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppLogger } from '@src/common/services/app-logger.service'
import { TransformInterceptor } from '@common/interceptors/transform.interceptor'
import { AppExceptionFilter } from '@common/exceptions/app-exception.filter'
import { AppValidationPipe } from '@common/pipes/app-validate.pipe'
import { TrimRequestBodyPipe } from '@common/pipes/trim-req-body.pipe'
import {
  init as sentryInit,
  Integrations as SentryIntegrations,
  Handlers as SentryHandlers,
  autoDiscoverNodePerformanceMonitoringIntegrations
} from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Sentry
  sentryInit({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // Automatically instrument Node.js libraries and frameworks
      ...autoDiscoverNodePerformanceMonitoringIntegrations(),
      // enable HTTP calls tracing
      new SentryIntegrations.Http({ tracing: true }),
      nodeProfilingIntegration()
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0
  })

  app.use(SentryHandlers.requestHandler())
  app.use(SentryHandlers.tracingHandler())

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
        persistAuthorization: true
      }
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
