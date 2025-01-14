import { CreateAccessControlMiddlewareConfig } from '../../../middlewares/AccessControlMiddlewareConfig';
import { AccessControlTypes } from '../../../definitions';

export default {
  routes: [
    {
      method: 'POST',
      path: '/operations/mapstate/currentlocation',
      handler: 'operation.currentLocation',
      config: {
        //this route does not update Operation itself therefore no UPDATE_BY_ID checks are needed
        middlewares: [CreateAccessControlMiddlewareConfig({type:'api::operation.operation', check: AccessControlTypes.BY_ID})]
      }
    },
    {
      method: 'POST',
      path: '/operations/mapstate/patch',
      handler: 'operation.patch',
      config: {
        //this route does not update Operation itself therefore no UPDATE_BY_ID checks are needed
        middlewares: [CreateAccessControlMiddlewareConfig({type:'api::operation.operation', check: AccessControlTypes.BY_ID})]
      }
    },
  ],
};
