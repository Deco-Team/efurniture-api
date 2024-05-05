export enum PaymentMethod {
  PAY_OS = 'PAY_OS',
  MOMO = 'MOMO',
  ZALO_PAY = 'ZALO_PAY'
}

export enum MomoResultCode {
  SUCCESS = 0,
  AUTHORIZED = 9000,
  FAILED = 'FAILED'
}

export enum PayOSResultCode {
  SUCCESS = '00',
  FAILED = '01',
  INVALID_PARAM = '02'
}

export enum PayOSStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}
