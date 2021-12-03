#!/bin/bash

opUri=$1
apikey=$2
project=$3
id=$4

if [ $# -ne 4 ];then echo "missing parameters: opUri apikey project id" ; exit ; fi

commentJson='{
  "comment": {
    "raw": "Ticket cerrado desde theeye"
  }
}'

#add comment
curl -s -X POST -u apikey:${apikey} -H 'Content-Type: application/json' ${opUri}/api/v3/work_packages/${id}/activities?notify=false -d "${commentJson}"

#get lockVersion
lockVersion=$(curl -s -u apikey:${apikey} -H 'Content-Type: application/json' ${opUri}/api/v3/work_packages/${id} | grep -o \"lockVersion\":[0-9]* | cut -d: -f2)

#status list: https://www.openproject.org/help/administration/manage-work-package-statuses/
#status=1 # new
#status=7 # in progress
status=13 # closed

closeJson='{
    "lockVersion":'"${lockVersion}"',
    "_links": {
        "status":{"href":"/api/v3/statuses/'"${status}"'"}
    }
}'

curl -o /dev/null -s -X PATCH -u apikey:${apikey} -H 'Content-Type: application/json' ${opUri}/api/v3/work_packages/${id} -d "${closeJson}"
