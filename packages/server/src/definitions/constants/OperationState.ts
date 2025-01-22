// DEPRECATED!!!

export const OperationStates = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const;
export type OperationState = (typeof OperationStates)[keyof typeof OperationStates];
