FROM node:6.11
MAINTAINER Javier Ailbirt <jailbirt@interactar.com>
ENV destDir /src/theeye/web
# Create app directory
RUN mkdir -p ${destDir}
# Temporary Move node_modules for avoiding packages reinstallation
RUN mv ${destDir}/node_modules /tmp/
# And remove that directory
RUN rm -rf ${destDir}
# Install Supervisor
#RUN npm install supervisor -g
#Set working Directory
WORKDIR ${destDir}
# Bundle app source
COPY . ${destDir}
# Move back packages
RUN mv /tmp/node_modules ${destDir}
# Install app dependencies
RUN cd ${destDir};npm install --production
RUN cd ${destDir};npm install
# Fix something weird related to sails dependencies.
RUN cd ${destDir}/node_modules/sails/ && npm install --production && cd ${destDir}
#Fix Permissions.
#commented, ya esta en la v. 15_09_16RUN mkdir ${destDir}/.tmp
#commented, ya esta en la v. 15_09_16 RUN chmod -R 1777 ${destDir}/.tmp
# Bundle app source
EXPOSE 6080
#By default run prod, If development is requiered This command would be override by docker-compose up
CMD ["npm","start"]
