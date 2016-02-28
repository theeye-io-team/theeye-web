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

echo "using NODE_ENV=development"
echo -e "\e[39m"

cd $path;

PORT=6080 DEBUG=eye:$debug NODE_ENV=development $nodemon $path/app.js

exit 0;
