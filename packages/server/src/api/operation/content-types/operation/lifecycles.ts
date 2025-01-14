import { lifecycleOperation } from '../../../../state/operation';

export default {
  afterCreate: ({ action, result }) => lifecycleOperation(action, result),
  afterUpdate: ({ action, result }) => lifecycleOperation(action, result),
  afterDelete: ({ action, result }) => lifecycleOperation(action, result),
};
