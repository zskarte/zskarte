FROM node:22.14.0-bookworm AS build-app

# Create app directory
WORKDIR /app

# npm install
ADD ./package.json /app/package.json
ADD ./package-lock.json /app/package-lock.json
ADD ./packages/app/package.json /app/packages/app/package.json
RUN npm ci 

# Copy all files
ADD --exclude=./packages/server . /app

# npm lint
RUN npm run lint:app
# npm build
RUN NODE_ENV=production npm run build:app && rm -rf /app/packages/app/src

FROM nginx:1.15.8-alpine

#Copy built angular files to NGINX HTML folder
COPY --from=build-app /app/packages/app/dist/zskarte/browser /usr/share/nginx/html
