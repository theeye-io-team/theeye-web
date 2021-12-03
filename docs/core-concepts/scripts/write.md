# Writing scripts

[![theeye.io](../../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

## Script responses

The agent will parse the last line of the scripts looking for a string which represents a `state` or a `json` result object.

A `state` could be any state or event linked to the task or monitor of this script. Default build-in events are `success` and `failure`.

So if your scripts ended ok, in bash you have to `echo "ok"` as the last output of your script.

> `success`, `normal` and `ok` are valid `success` states.
>
> `failure` and `fail` are valid `failure` states.

## Some code

This is a simple check with success and failure

```bash
# Some comands and checks here

# ...

# And at the end of the script...

if [ $check == true ]; then
  echo "success"
  exit
else
  echo "failure"
  exit
fi

# or you can keep doing more things, you can control the flow of your script and end it when anytime
echo "success"
```

If you need to report extra information to the api, you have to send the information to stdout in json format like this

```bash
varUno="value1"
varTwo="value2"

# This will output valid JSON and will be parsed by the agent
# Write JSON by hand is ugly, we will improve this in the feature
if [ true ]; then
  echo { \"state\":\"success\", \"data\":{ \"val1\":$varTwo, \"val2\":$varUno } }
else
  echo { \"state\":\"failure\", \"data\":{ \"val1\":$varTwo, \"val2\":$varUno } }
fi
```

The JSON output needs to include a `state` property with the final state of your script, and a `data` property with any extra information you want to send to the api.

If you need to validate the JSON output of your scripts, you can use this simple nodejs script - there are also nice web sites that can validate JSON for you too. Change it for your case

`test_json.js`

```javascript
// test.js
var exec = require('child_process').exec;

exec('./test.sh', function(err, stdout, stderr){
    var obj = JSON.parse(stdout);

    // if the stdout string was parsed successfuly the next sentence will give the members number - which is 1
    console.log( obj.data );
});
```

the `test.sh` script looks like this

```bash
#!/bin/bash

state='normal'
POOL='pool'
members=1

# this is valid json when send to stdout
echo { \"state\" : \"$state\" , \"data\" : { \"members\" : $members } }
# this will echo { "state": "normal" , "data" : { "members": 1 } }
```

There are a lot of sample scripts, written in different languages wich are in production today.

Check our [TheEye-io gist](https://gist.github.com/theeye-io) scripts page.

## TheEye Sample Scripts

Check the [Assets script for samples](/assets/scripts/) for more details.
