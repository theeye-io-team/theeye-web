FROM node:alpine

LABEL maintainers.main="Facundo Gonzalez <facugon@theeye.io>"

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
ENV destDir /app

WORKDIR ${destDir}
COPY . ${destDir}

RUN cd ${destDir}; \
  npm install; \
  npm run build-prod
