#!/bin/bash

alarm=$1
region=$2

if [ $# -ne 2 ];then echo "missing alarmName" ; exit ; fi

alarmStateValue=$(aws cloudwatch --region $region describe-alarms --alarm-names "${alarm}" | jq .MetricAlarms[].StateValue | tr -d '"')
echo -e "Alarm: ${alarm}\nState: ${alarmStateValue}"

if [ "$alarmStateValue" == "OK" ]
then
  echo "normal"
else
  echo "failure"
fi
