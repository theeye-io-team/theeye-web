#/bin/bash

echo -e "\e[92m"

require='/usr/bin/supervisor'
path=`dirname $0`

if [ ! -f $require ]
then
    echo "Error $require is not present on this system, please install it by typing npm install -g supervisor" 
    exit
fi

DIR=$(dirname $0)
cd $DIR
echo "Executing on $DIR && $(pwd)"

echo -e "\e[39m"

if [ -z ${DEBUG+x} ]; then
  DEBUG='eye:*:error'
fi
export DEBUG

PORT=1337 NODE_ENV=production $require -i . $path/app.js

exit 0;
