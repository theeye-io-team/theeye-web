#!/bin/bash

opUri=$1
apikey=$2
project=$3

if [ $# -ne 3 ];then echo "missing parameters: apikey project opUri" ; exit ; fi

json='{
    "subject":"[Automated Ticket] Test Subject",
    "description": {
        "format": "textile",
        "raw": "Ticket Creado automáticamente desde Theeye."
    },
    "_links": {
        "type": {"href":"/api/v3/types/1"},
        "status":{"href":"/api/v3/statuses/1"},
        "priority":{"href":"/api/v3/priorities/8"}
    }
}'

#create work package
output=$(curl -s -X POST -u apikey:${apikey} -H 'Content-Type: application/json' ${opUri}/api/v3/projects/${project}/work_packages/ -d "${json}")
id=$(echo "${output}" | grep -o \"WorkPackage\",\"id\":[0-9]* | cut -d: -f2)
echo "{\"state\":\"success\",\"data\":[\"${opUri}/projects/${project}/work_packages/${id}\"]}"
