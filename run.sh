#/bin/bash

echo -e "\e[92m"

#doesn't play nice with harmony_proxy require=`which supervisor`
path=`dirname $0`
require=`which nodemon`

#doesn't play nice with harmony_proxy if [ ! -f $require ]
#                                     then
#                                         echo "Error $require is not present on this system, please install it by typing npm install -g supervisor" 
#                                         exit
#                                     fi

DIR=$(dirname $0)
cd $DIR
echo "Executing on $DIR && $(pwd)"

echo -e "\e[39m"

if [ -z ${DEBUG+x} ]; then
  DEBUG='eye:*:error'
fi
export DEBUG

if [ -z $NODE_ENV ];then
   echo "!!NODE ENV NOT CONFIGURED, DEFAULT NODE_ENV=$NODE_ENV"
   export NODE_ENV=production
fi

PORT=6080 $require -i . $path/app.js

exit 0;
