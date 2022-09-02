FROM node:14-alpine

LABEL maintainers.main="Facundo Gonzalez <facugon@theeye.io>"

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
ENV destDir /app

ARG APP_VERSION
ENV APP_VERSION $APP_VERSION
ENV destDir /app

RUN echo NODE_ENV $NODE_ENV APP_VERSION $APP_VERSION

WORKDIR ${destDir}
COPY . ${destDir}

RUN cd ${destDir}; \
  npm install; \
  npm run build-prod
