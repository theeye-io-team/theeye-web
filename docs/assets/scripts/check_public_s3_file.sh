#!/bin/bash

#https://s3.amazonaws.com/theeye-ova/datos_elk.txt

url=$1

if [ $# -ne 1 ];then echo "missing parameter" ; exit ; fi

wget --spider $url &> /dev/null

if [ $? -eq 0 ]
then
  echo "check ok ${url} found"
  echo "normal"
else
  echo "check failed ${url} not found"
  echo "failure"
fi
