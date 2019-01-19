FROM node:6
MAINTAINER Javier Ailbirt <jailbirt@interactar.com>
ENV destDir /src/theeye/web
# Create app directory
RUN mkdir -p ${destDir}
# Install Supervisor
#RUN npm install supervisor -g
#Set working Directory
WORKDIR ${destDir}
# copy app source
COPY . ${destDir}
# Install app dependencies
RUN cd ${destDir};npm install --production
RUN cd ${destDir};npm install
# Fix something weird related to sails dependencies.
RUN cd ${destDir}/node_modules/sails/ && npm install --production
RUN cd ${destDir}/node_modules/sails/node_modules/express && npm install --production
RUN cd ${destDir}/node_modules/sails/node_modules/socket.io && npm install --production
RUN cd ${destDir}

RUN rm -rf ${destDir}/.tmp
RUN mkdir ${destDir}/.tmp
#Fix Permissions.
RUN chmod -R 1777 ${destDir}/.tmp

# Bundle app source
#RUN ${destDir}/node_modules/webpack/bin/webpack.js

EXPOSE 6080
#By default run prod, If development is requiered This command would be override by docker-compose up
CMD ["npm","start"]
