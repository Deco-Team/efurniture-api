export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DELIVERING = 'DELIVERING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  DELETED = 'DELETED'
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  CAPTURED = 'CAPTURED',
  ERROR = 'ERROR',
  CANCELED = 'CANCELED',
  DELETED = 'DELETED',
  REFUNDED = 'REFUNDED'
}

export enum UserSide {
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  DELIVERY_STAFF = 'DELIVERY_STAFF',
  CONSULTANT_STAFF = 'CONSULTANT_STAFF',
  CUSTOMER = 'CUSTOMER'
}

export enum StaffRole {
  STAFF = 'STAFF',
  DELIVERY_STAFF = 'DELIVERY_STAFF',
  CONSULTANT_STAFF = 'CONSULTANT_STAFF'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum Dimension {
  '2D' = '2D',
  '3D' = '3D'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  DELETED = 'DELETED'
}

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum TaskType {
  SHIPPING = 'SHIPPING',
  CONSULTANT = 'CONSULTANT',
  CHORE = 'CHORE'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELETED = 'DELETED'
}

export enum AnalyticPeriod {
  DAY = 'DAY',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export enum ReviewStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED'
}