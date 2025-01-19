FROM node:20.18.1-slim AS build

# Create app directory
WORKDIR /app

# npm install
ADD ./package.json /app/package.json
ADD ./package-lock.json /app/package-lock.json
ADD ./packages/server/package.json /app/packages/server/package.json
RUN npm ci 

# Copy all files
ADD . /app

# npm lint
RUN npm run lint:server
# npm build
RUN NODE_ENV=production npm run build:server && rm -rf /app/packages/server/src


FROM node:20.18.1-slim AS release
# switzerchees: Optimize for alpine again fix sharp install issue first
# FROM node:20.18.1-alpine AS release
# RUN apk update && apk add --no-cache tzdata

WORKDIR /app
ENV HOST=0.0.0.0
USER node
EXPOSE 1337

COPY --from=build --chown=node:node /app/node_modules /app/node_modules
COPY --from=build --chown=node:node /app/packages/server /app/packages/server
COPY --from=build --chown=node:node /app/package.json /app/package.json

# start command
CMD ["npm", "run", "start:server"] 