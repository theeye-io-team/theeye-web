FROM node:14-alpine

LABEL maintainers.main="Facundo Gonzalez <facugon@theeye.io>"

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

#ARG APP_VERSION
#ENV APP_VERSION $APP_VERSION

ENV destDir /app

WORKDIR ${destDir}
COPY . ${destDir}

RUN apk add git; \
      cd ${destDir}; \
      export APP_VERSION=$(git describe); \
      echo APP_VERSION is $APP_VERSION; \
      echo NODE_ENV is $NODE_ENV; \
      npm install; \
      npm run build-prod
