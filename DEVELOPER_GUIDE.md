# Developer infos

## Add new types

### Add the middleware
To make the accessControl logic accept your API requests, you have do define the accessControl middlerware for your new type.
On types with default api endpoint you have to change `packages/server/src/api/typename/routes/typename.ts` from
```
import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::typename.typename');
```
to
```
import { factories } from '@strapi/strapi';
import { AccessControlMiddlewareRoutesConfig } from '../../../middlewares/AccessControlMiddlewareConfig';

export default factories.createCoreRouter(
  'api::typename.typename',
  AccessControlMiddlewareRoutesConfig({ type: 'api::typename.typename' }),
);
```
If you have additional endpoints, you have to add the middleware to each of the corresponding route config.
For the `check` parameter you have to choose the matching `AccessControlTypes` value for the action.
```
import { CreateAccessControlMiddlewareConfig } from '../../../middlewares/AccessControlMiddlewareConfig';
import { AccessControlTypes } from '../../../definitions';

export default {
  routes: [
    {
      method: 'PUT',
      path: '/typename/:id/additionalendpoint',
      handler: 'typename.additionalfunction',
      config: {
        middlewares: [
          CreateAccessControlMiddlewareConfig({ type: 'api::typename.typename', check: AccessControlTypes.UPDATE_BY_ID }),
        ],
      },
    },
  ],
};
```

### Update TypeGuards
The accessControl logic works by verify the current user have rights to access the requested type/entry by verify it have right for the linked `operation` or `organization`.
To choose the right read/verify logic the new type have to been added to `packages/server/src/definitions/TypeGuards.ts` to the corresponding `HasOperationTypes` or/and `HasOrganizationTypes` type lists.


### Update rights
If you add new types to the strapi db, you also need to update the corresponding rights for the different right groups.
You can do that in the strapi admin: Settings -> Users & Permissions plugin -> [Roles](http://localhost:1337/admin/settings/users-permissions/roles)

After that update the saved right files by call:
```
npm run server:export
```
Also include the updated `packages/server/config/sync/*` files in your pull request for the new type.


### update init.sql
After all changes are set and work as expected it would make sense to create a new init.sql for new developers.
You can do that the folowing predefined function:
```
npm run server:update-init
```
<details>
<summary>Manual steps</summary>

The command include the following manual steps:

Stop DB and backup you data:
```
npm run server:export
npm run docker-stop
mv data data_backup
```
If you have Linux/WSL redo the [prequisites](https://github.com/zskarte/zskarte?tab=readme-ov-file#linuxwsl-prerequisites)

Now reinitialize a clean db, update / import the newest right configs and do an export of the DB afterwards.
```
npm run docker-run
npm run server:import
./scripts/dump-sort-db.sh
```

To go back to your DB/data do:
```
npm run docker-stop
mv data_backup data
npm run docker-run
```
</details>
