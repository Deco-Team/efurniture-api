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