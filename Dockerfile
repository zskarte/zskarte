FROM node:22.14.0-slim AS build

# Create app directory
WORKDIR /app

# Install workspace dependencies
COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY packages/common/package.json ./packages/common/package.json
COPY packages/server/package.json ./packages/server/package.json
COPY packages/app/package.json ./packages/app/package.json
RUN npm ci

# Copy source files
COPY . ./

# Lint server
RUN npm run lint:server

# Build workspace packages in dependency order and prune source files
RUN npm run build:types && \
    npm run build:common && \
    NODE_ENV=production npm run build:server && \
    rm -rf /app/packages/server/src /app/packages/common/src /app/packages/types/src /app/packages/server/test


FROM node:22.14.0-slim AS release

WORKDIR /app
ENV HOST=0.0.0.0 \
    PORT=1338 \
    NODE_ENV=production

USER node
EXPOSE 1338

COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/packages/types ./packages/types
COPY --from=build --chown=node:node /app/packages/common ./packages/common
COPY --from=build --chown=node:node /app/packages/server ./packages/server
COPY --from=build --chown=node:node /app/package.json ./package.json

# Start server
CMD ["npm", "run", "start:server:prod"]