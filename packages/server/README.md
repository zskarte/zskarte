## Quick Start Guide

### 1. Install packages
```bash
npm install
```

### 2. Start the postgresql and pgadmin services
```bash
cd packages/server
docker-compose up -d
```

### 3. Restore postgresql dump with pgadmin
  1. Open pgadmin on http://localhost:7050
  2. Login with credentials: User -> info@zskarte.ch, Password -> zskarte
  3. Add Server: (Check in README) PGAdmin -> Create a database 
  4. Use the dump file in packages/server/database -> *_DEFAULT.bak
  5. Right click on Databases -> zskarte -> Restore -> Select the dump file -> Restore

### 4. Copy .env example file and rename it to .env you can keep the values as they are
```bash
cp .env.example .env
```

### 5. Start the Strapi application
```bash
# Start the Strapi application
npm run build # Sometimes needed to build the admin panel initially
npm run dev
```

### 6. Open the Strapi admin panel
  1. http://localhost:1337/admin
  2. Login with credentials: User -> info@zskarte.ch, Password -> Supersecret123

### 7. Check Strapi docs for more information
  1. https://docs.strapi.io/


## Supporting Tools for Development

Different containerized services to use in the development process like postgresql and pgadmn

### Linux prerequisites

```bash
# Create the data/postgresql folder
mkdir -p data/postgresql
# Add the UID 1001 (non-root user of postgresql) as the folder owner
chown -R 1001:1001 data/postgresql
```

### Docker-Compose

This will startup a local postgresDB with a RDMS system (pgadmin).

#### Start

```bash
# docker version < 20.10.x
docker-compose up -d
# docker version >= 20.10.x
docker compose up -d
```

> 💡 If you have trouble with the creation of the containers use: `docker compose up -d --force-recreate`

#### Stop

```bash
# docker version < 20.10.x
docker-compose down
# docker version >= 20.10.x
docker compose down
```

### Environment Variables

An .env file has to be located inside the root folder for the application to start. There is an example .env file in the repo called ".env.example". For local development only, you can use the example file (rename it to ".env").

### PGAdmin

A postgresql database management tool

- PostgreSQL:
  - User: postgres
  - Password: supersecret123

#### Create a database

1. Open [pgadmin](http://localhost:7050/)
2. Login
   - Email: info@zskarte.ch
   - Password: zskarte
3. Add Server (right click on Servers)
   - Register -> Server
     - Name: postgres-local
     - Host: postgresql-zskarte
     - Port: 5432
     - Username: postgres
     - Password: supersecret123
     - Save-Password: yes
4. Create database (right click on Servers -> Server -> Databases)
   - Create -> Database
     - Name: zskarte

#### Persist database connections

```bash
# Execute inside pgadmin docker container
docker exec -it pgadmin sh
# Dump Actual connections into servers.json file to
/venv/bin/python setup.py dump-servers --user info@zskarte.ch servers.json
```

##### Troubleshooting

Your should have created empty file servers.json before starting the container (with docker compose) or docker would create an folder, that does not fit the needs.
If this happen use

```bash
/venv/bin/python setup.py dump-servers --user info@zskarte.ch servers.json/file
```

to save the configuration instead.
Than stop the compose, move the file out of the folder, delete the folder and rename file to server.json.
Now remove the old pgadmin-zskarte (`docker rm pgadmin-zskarte`) and start the compose again.

#### Seed data & set up authorization

The application needs some data in order to work propperly. Curently, there is no seeding mechanism for an example organization. Follow those steps to create one:

1. Open the [strapi admin](http://localhost:1337/admin) (call `npm run start` if not yet started)
2. Create an organization
   - Content Manager -> Organisation -> Create new entry
3. Create an user for the organization
   - Content Manager -> User -> Create new entry
     - Add role "Organization"
     - Add organization (the one created in step 2)
4. Set permissions for "Authenticated" role
   - Settings -> User & Permissions Plugin -> Roles -> Authenticated
     - Give "find" and "findOne" rights on Organization
     - Give all rights (except "delete" and "update") on Operation
     - Give "find" and "findOne" rights on Map-snapshot
     - Give "me" right on Users-permission -> USER
5. Set permissions for "Public" role (to make login page work)
   - Settings -> User & Permissions Plugin -> Roles -> Public
     - Give "forLogin" right on Organization
     - Give "find" right on Users-permission -> USER

##### Enable guest login

To activate this function you need to add a special organisation with specific user & password:

1. Create an organization
   - Content Manager -> Organisation -> Create new entry
     - Name the Organisation "ZSO Gast (1h)"
2. Create an user for the organization
   - Content Manager -> User -> Create new entry
     - Name the user "zso_guest"
     - Use password "zsogast"
     - Add role "Authenticated"
     - Add organization "ZSO Gast (1h)"

##### Enable share links

To activate this function you need to update rights, add a special users and authenticate roles:

1. Set permissions for "Authenticated" role
   - Settings -> User & Permissions Plugin -> Roles -> Authenticated
     - Give all rights on Access
2. Set permissions for "Public" role (to make login page work)
   - Settings -> User & Permissions Plugin -> Roles -> Public
     - Give "token" rights on Access
3. Create roles for share modes (read/write)
   - Settings -> User & Permissions Plugin -> Roles -> Create new entry
     - Name the role "ShareRead"
     - Use "Read role for share links" as description
     - Give "currentLocation", "findOne", "overview" right on Operation
     - Give "find" and "findOne" rights on Map-snapshot
     - Give "me" right on Users-permission -> USER
   - Settings -> User & Permissions Plugin -> Roles -> Create new entry
     - Name the role "ShareWrite"
     - Use "Write role for share links" as description
     - Give "currentLocation", "findOne", "overview", "patch", "updateMeta" right on Operation
     - Give "find" and "findOne" rights on Map-snapshot
     - Give "me" right on Users-permission -> USER
4. Create an user for the Share roles
   - Content Manager -> User -> Create new entry
     - Name the user "operation_read"
     - Use a secure password
     - Add role "ShareRead"
     - Add NO organization
   - Content Manager -> User -> Create new entry
     - Name the user "operation_write"
     - Use a secure password
     - Add role "ShareWrite"
     - Add NO organization

##### Enable Wms-Source and Map-Layer persistency

To activate this function you need to update rights:

1. Set permissions for "Authenticated" role
   - Settings -> User & Permissions Plugin -> Roles -> Authenticated
     - Give all rights on Map-layer
     - Give "updateLayerSettings" rights on Organization
     - Give all rights on Wms-source
2. Set permissions for "Organization" role
   - Settings -> User & Permissions Plugin -> Roles -> Organization
     - Give all rights on Map-layer
     - Give "updateLayerSettings" rights on Organization
     - Give all rights on Wms-source
3. Set permissions for "Public" role (to access on local/offline mode)
   - Settings -> User & Permissions Plugin -> Roles -> Public
     - Give "find" and "findOne" rights on Map-layer
     - Give "find" and "findOne" rights on Wms-source
4. Set permissions for "ShareRead" role (to access on local/offline mode)
   - Settings -> User & Permissions Plugin -> Roles -> ShareRead
     - Give "find" and "findOne" rights on Map-layer
     - Give "find" and "findOne" rights on Wms-source
5. Set permissions for "ShareWrite" role (to access on local/offline mode)
   - Settings -> User & Permissions Plugin -> Roles -> ShareWrite
     - Give all rights (except "delete") on Map-layer
     - Give "updateMapLayers" right on Operation
     - Give all rights (except "delete") on Wms-source

## Azure

### Kubernetes Connect

Connect to the AKS cluster with the following commands

```bash
# Install azure cli on MAC
brew update && brew install azure-cli

az login
az aks get-credentials --subscription zskarte --resource-group zskare --name zskare-aks --admin
# Switch your kubeconfig context (install kubectx first)
kubectx zskarte-aks-admin
# Switch to Test namespace (kubens doesn't work)
kubectl config set-context --current --namespace zskarte-test
# Switch to Prod namespace (kubens doesn't work)
kubectl config set-context --current --namespace zskarte-prod
```

#### Connect to pgadmin on AKS

```bash
kubectl port-forward service/pgadmin 7050:80
```

### Cheap AKS Cluster

https://georgepaw.medium.com/how-to-run-the-cheapest-kubernetes-cluster-at-1-per-day-tutorial-9673f062b903

```bash
# Fill env variables
export SUBSCRIPTION=66961ec5-0870-43fb-a5cc-35e73d6d49d2
export LOCATION=switzerlandnorth
export RESOURCE_GROUP=zskarte
export AKS_CLUSTER=zskarte-aks
export VM_SIZE=Standard_B2s

# Create SSH key pair to login to instance in the future filename: zskarte
ssh-keygen -t rsa -b 4096 -C "zskarte"

# Create resource group
az group create --name $RESOURCE_GROUP \
		--subscription $SUBSCRIPTION \
		--location $LOCATION

# Create a basic single-node AKS cluster
az aks create \
	--subscription $SUBSCRIPTION \
	--resource-group $RESOURCE_GROUP \
	--name $AKS_CLUSTER \
	--vm-set-type VirtualMachineScaleSets \
	--node-count 1 \
	--ssh-key-value zskarte.pub \
	--load-balancer-sku basic \
	--enable-cluster-autoscaler \
	--min-count 1 \
	--max-count 1 \
    --node-vm-size $VM_SIZE \
    --nodepool-name default \
    --node-osdisk-size 32 \
    --node-osdisk-type managed

# Get credentials of AKS cluster
az aks get-credentials \
	--subscription $SUBSCRIPTION \
	--resource-group $RESOURCE_GROUP \
	--name $AKS_CLUSTER \
    --admin
```

### Disable AKS SLA

```bash
AKSResourceID=$(az aks show --subscription $SUBSCRIPTION --name $AKS_CLUSTER --resource-group $RESOURCE_GROUP --query id -o tsv)
az resource update --ids $AKSResourceID --subscription $SUBSCRIPTION --set sku.tier="Free"
```

## Helm add Bitnami repo

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
```

### Install NGINX Ingress

```bash
helm upgrade --install nginx-ingress-controller bitnami/nginx-ingress-controller --create-namespace -n nginx-ingress-controller -f .azure/aks/nginx/values.yml
```

### Install Cert-Manager

```bash
helm upgrade --install cert-manager bitnami/cert-manager --create-namespace -n cert-manager -f .azure/aks/cert-manager/values.yml
kubectl apply -f .azure/aks/cert-manager/letsencrpyt-staging.yml
kubectl apply -f .azure/aks/cert-manager/letsencrpyt-prod.yml
```
