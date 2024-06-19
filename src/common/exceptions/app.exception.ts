import { HttpStatus } from '@nestjs/common'

const ErrorResponseDefaultValues = {
  error: 'INTERNAL_SERVER_ERROR',
  httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
  data: {}
}

export interface ErrorResponse {
  message: string
  error?: string
  httpStatus?: number
  data?: any
}

export class AppException extends Error {
  error: any
  httpStatus: any
  data: any
  constructor(params: ErrorResponse) {
    const initData = Object.assign(Object.assign({}, ErrorResponseDefaultValues), params)
    super(initData.message)
    this.error = initData.error
    this.httpStatus = initData.httpStatus
    this.data = initData.data
  }
}
