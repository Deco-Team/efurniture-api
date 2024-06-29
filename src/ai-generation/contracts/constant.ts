export enum AIGenerationPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

export enum AIGenerationPlatform {
  TRIPO_3D_AI = 'TRIPO_3D_AI',
  EDEN_AI = 'EDEN_AI'
}

export enum AIGenerationType {
  TEXT_TO_MODEL = 'TEXT_TO_MODEL',
  TEXT_TO_IMAGE = 'TEXT_TO_IMAGE'
}

export enum AIGenerationTaskStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  UNKNOWN = 'unknown'
}

export enum AIGenerationTaskProgress {
  QUEUEING = 0,
  RUNNING = 'RUNNING',
  SUCCESS = 100
}

export const DEFAULT_CREDITS = 30;

export enum AIGenerationPricing {
  TEXT_TO_MODEL = 15,
  TEXT_TO_IMAGE = 10
}

export enum AIPricingPlan {
  PERSONAL = 'PERSONAL',
  PREMIUM = 'PREMIUM'
}

export const AIPricingPlanCost =  {
  [AIPricingPlan.PERSONAL] : 49000,
  [AIPricingPlan.PREMIUM] : 119000
}

export const AIPricingPlanCredits =  {
  [AIPricingPlan.PERSONAL] : 60,
  [AIPricingPlan.PREMIUM] : 150
}
