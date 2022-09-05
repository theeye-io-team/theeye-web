FROM node:14-alpine

LABEL maintainers.main="Facundo Gonzalez <facugon@theeye.io>"

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

ARG APP_VERSION
ENV APP_VERSION $APP_VERSION

RUN echo APP_VERSION is $APP_VERSION; \
      echo NODE_ENV is $NODE_ENV;

ENV destDir /app

WORKDIR ${destDir}
COPY . ${destDir}

RUN cd ${destDir}; \
      npm install; \
      npm run build-prod
