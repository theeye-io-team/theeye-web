#!/bin/bash

region=$1
logGroup=$2
pattern=$3
timePattern=$4

if [ $# -ne 4 ];then echo "missing arg" ; exit ; fi

startTime=$(date -u +%s%3N --date "$timePattern")

data=$(aws logs --region $region filter-log-events --log-group-name ${logGroup} --filter-pattern "${pattern}" --start-time "${startTime}")
events=$(echo "${data}" | jq -r .events[])

if [ "$(echo "${data}" | jq -r .events[])" = "" ]
then
  echo "no events found"
  echo "normal"
else
  echo "events found"
  echo "${events}"
  echo "failure"
fi
