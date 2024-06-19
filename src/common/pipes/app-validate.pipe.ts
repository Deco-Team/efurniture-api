import { ValidationPipe, ValidationPipeOptions, ValidationError, HttpStatus } from '@nestjs/common'
import { AppException } from '@common/exceptions/app.exception'
import * as _ from 'lodash'

export class AppValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      ...options,
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        throw new AppException({
          error: 'INVALID_PARAMS',
          message: AppValidationPipe.getFirstMessage(validationErrors),
          httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
          data: validationErrors
        })
      }
    })
  }

  static getFirstMessage(validationErrors?: ValidationError[]): string {
    let message: any = 'Params are invalid'
    if (validationErrors.length) {
      const firstError = validationErrors[0]
      if (firstError.constraints) {
        console.log(Object.values(firstError.constraints))
        message = _.get(Object.values(firstError.constraints), '[0]', message)
      } else {
        message = AppValidationPipe.getFirstMessage(firstError.children)
      }
    }
    return message
  }
}
