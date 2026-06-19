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


# EOF with single quotes to suppress $-expansion
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen       80;

    error_log /dev/stdout debug;

    root   /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
EOF

#Copy built angular files to NGINX HTML folder
COPY --from=build-app /app/packages/app/dist/zskarte/browser /usr/share/nginx/html
