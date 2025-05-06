# 🗺️ Zivilschutz-Karte

![GitHub license](https://img.shields.io/github/license/zskarte/zskarte)
![GitHub release](https://img.shields.io/github/v/release/zskarte/zskarte)
![GitHub last commit](https://img.shields.io/github/last-commit/zskarte/zskarte)
![GitHub contributors](https://img.shields.io/github/contributors/zskarte/zskarte)
![GitHub pull requests](https://img.shields.io/github/issues-pr/zskarte/zskarte)
![GitHub forks](https://img.shields.io/github/forks/zskarte/zskarte)
![GitHub stars](https://img.shields.io/github/stars/zskarte/zskarte)
![GitHub watchers](https://img.shields.io/github/watchers/zskarte/zskarte)
![GitHub followers](https://img.shields.io/github/followers/zskarte)
![GitHub repo size](https://img.shields.io/github/repo-size/zskarte/zskarte)
![GitHub code size](https://img.shields.io/github/languages/code-size/zskarte/zskarte)
![GitHub language count](https://img.shields.io/github/languages/count/zskarte/zskarte)
![GitHub top language](https://img.shields.io/github/languages/top/zskarte/zskarte)
![GitHub issues](https://img.shields.io/github/issues/zskarte/zskarte)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![ZSKarte.ch](https://img.shields.io/website?url=https%3A%2F%2Fwww.zskarte.ch)](https://www.zskarte.ch)

## ℹ️ About

Zivilschutz-Karte is a powerful JavaScript application (based on Angular) designed for creating detailed situation maps for disaster management. Developed specifically for Swiss civil defense organisations, it works seamlessly on both standard computers and interactive whiteboards. 🖥️ 📱

## 🔍 Key Features

- 🎨 Intuitive drawing interface
- 🌍 Multiple map provider integration
- 💾 Local storage support
- 🔄 Real-time collaboration
- 📱 Responsive design
- 🔒 Secure authentication

## 👀 Demo

You can run Zivilschutz-Karte without installation from [https://zskarte.ch](https://zskarte.ch). This is the production application. Please request access from your civil defence organisation or use the guest mode to try out.

<img alt="Screenshot of ZS-Karte" src="https://github.com/user-attachments/assets/c06261e2-7505-4d57-9834-1cee7aa5b8a4" />

## 🚀 Getting Started

### 🛠️ Prerequisites

- 📦 Node.js 20.x
- 🔧 npm 10.x
- 🐳 docker 27.x or higher

### 📋 Installation Steps

### 1. Install packages
```bash
npm install
```

### 2. For Server copy .env.example file and rename it to .env (you can keep the values as they are for local development)
```bash
cp packages/server/.env.example packages/server/.env
```

### 3. Start the application (database, backend, frontend)
```bash
npm run start
```

### 4. Access the Strapi admin panel (Backend)
  1. http://localhost:1337/admin
  2. Login with credentials: User -> info@zskarte.ch, Password -> Supersecret123

### 5. Access the Zivilschutz-Karte application (Frontend)
Zivilschutz-Karte is optimized and tested for use with Google Chrome - nevertheless other browsers might work as well and are supported in a best effort manner.
  1. http://localhost:4300
  2. Login with credentials: User -> zso_development, Password -> Supersecret123

## 💡 Help & Feedback

Need assistance or want to share your thoughts? We'd love to hear from you! 
- 🐛 Create an issue on GitHub
- 📧 Send feedback to [feedback@zskarte.ch](mailto:feedback@zskarte.ch)
- 💬 Join our community discussions

## ⚖️ Terms of Use

Please note, that this application integrates several different map provider services. Since the terms of use of the different services usually restrict the extent of use (limited quotas, restricted access to data layers), it's the liability of the user to make sure that the corresponding limitations and/or preconditions are fulfilled.

## 🛠️ Development Tools

### 🐳 Docker-Compose

This will startup a local postgresDB with a RDMS system (pgadmin).

#### Start

```bash
# docker version < 20.10.x
docker-compose up -d
# docker version >= 20.10.x
docker compose up -d
```

> 💡 If you have trouble with the creation of the containers use: `docker compose up -d --force-recreate` or check Linux/WSL prerequisites.

#### Stop

```bash
# docker version < 20.10.x
docker-compose down
# docker version >= 20.10.x
docker compose down
```

### PGAdmin

A postgresql database management tool
[pgadmin](http://localhost:7050/)

- PostgreSQL:
  - User: postgres
  - Password: supersecret123

### Linux/WSL prerequisites

```bash
# Create the data/postgresql folder
mkdir -p data/postgresql
# Add the UID 1001 (non-root user of postgresql) as the folder owner
sudo chown -R 1001:1001 data/postgresql
# Create the data/pgadmin folder
mkdir -p data/pgadmin
# Add the UID 5050 (non-root user of pgadmin) as the folder owner
sudo chown -R 5050:5050 data/pgadmin
```
### Informations for developer

More informations for developers for internal logic / tasks can be found in [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md).

## ☁️ Azure Setup

### 🔗 Kubernetes Connect

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
kubectl port-forward service/pgadmin 8050:80 -n pgadmin
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

## 🤝 Contributing

We welcome contributions! Here's how you can help:
- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📚 Improve documentation

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Star Us!

If you find this project useful, please consider giving it a star on GitHub! ⭐
