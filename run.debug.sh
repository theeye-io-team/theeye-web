#!/bin/bash

path=`pwd`
debug=*
#nodemon=`./node_modules/.bin/nodemon`
nodemon=`which nodemon`

if [ -z $1 ]
then
    debug="*"
else
    debug=$1
fi

echo -e "\e[92m"

echo "using NODE_ENV=$NODE_ENV"
echo -e "\e[39m"

if [ -z $NODE_ENV ];then
   echo "!!NODE ENV NOT CONFIGURED, DEFAULT NODE_ENV=$NODE_ENV"
   export NODE_ENV=development
fi

cd $path;
echo "Installing packages, useful for development envs"
npm install

PORT=6080 DEBUG=eye:$debug  $nodemon $path/app.js

exit 0;
