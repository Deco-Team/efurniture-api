export enum AIGenerationPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

export enum AIGenerationType {
  TEXT_TO_MODEL = 'TEXT_TO_MODEL'
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