export const OperationPhases = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const;
export type OperationPhase = (typeof OperationPhases)[keyof typeof OperationPhases];
