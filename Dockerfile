FROM node:20-alpine as builder
LABEL maintainer="getsolaris.kr@gmail.com"

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN npm install -g @nestjs/cli

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

RUN yarn install

COPY . /app

RUN yarn build


FROM node:20-alpine as production
LABEL maintainer="getsolaris.kr@gmail.com"

RUN apk update

RUN apk add curl

RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime \
    && echo "Asia/Seoul" > /etc/timezone

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules

WORKDIR /app

EXPOSE 8080

ENTRYPOINT ["node", "dist/main.js"]
