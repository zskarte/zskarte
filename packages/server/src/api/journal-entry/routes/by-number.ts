import { CreateAccessControlMiddlewareConfig } from '../../../middlewares/AccessControlMiddlewareConfig';
import { AccessControlTypes } from '../../../definitions';

export default {
  routes: [
    {
      method: 'GET',
      path: '/journal-entries/by-number/:number',
      handler: 'journal-entry.byNumber',
      config: {
        //The LIST type of accessControl automatically add operation and user organisation filters
        middlewares: [CreateAccessControlMiddlewareConfig({ type: 'api::journal-entry.journal-entry', check: AccessControlTypes.LIST })],
      },
    },
  ],
};
