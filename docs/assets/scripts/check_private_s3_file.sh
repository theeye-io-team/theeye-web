#!/bin/bash

bucket=$1
file=$2
tmp=/tmp/s3.test

if [ $# -ne 2 ];then echo "missing parameter" ; exit ; fi

aws s3 cp s3://${bucket}/${file} $tmp &> /dev/null

if [ $? -eq 0 ]
then
  echo "check ok ${bucket}/${file} found"
  echo "normal"
else
  echo "check failed ${bucket}/${file} not found"
  echo "failure"
fi

rm -f $tmp
