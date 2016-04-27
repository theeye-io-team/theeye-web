FROM node:0.12
MAINTAINER Javier Ailbirt <jailbirt@interactar.com>
ENV destDir /src/theeye/web
# Create app directory
RUN mkdir -p ${destDir}
# Install Supervisor
#RUN npm install supervisor -g
#Set working Directory
WORKDIR ${destDir}
# Bundle app source
COPY . ${destDir}
# Install app dependencies
RUN cd ${destDir}; npm install
# Fix something weird related to sails dependencies.
RUN cd ${destDir}/node_modules/sails/ && npm install && cd ${destDir}
#Fix Permissions.
RUN mkdir ${destDir}/.tmp
RUN chmod -R 1777 ${destDir}/.tmp
# Bundle app source
EXPOSE 6080
#By default run prod, If development is requiered This command would be override by docker-compose up
CMD [ "npm", "run","start" ]
