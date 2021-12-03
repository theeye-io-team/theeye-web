# Working with Scripts

[![theeye.io](../../images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

## Create a Script

Scripts can be written directly from a live editor or can be uploaded by dropping files over the _Files & Scripts_' creation window. The live editor will recognize the notation language \(interpreter\) once you name the script file and set an extension \(e.g. runme.sh\). Bash, Python, Perl, Node and bat files are recognized, but any script can be executed as long as the interpreter is available in the destination host.

TheEye will carry out the script execution over tasks. Check the [tasks' documentation](../tasks/#create-a-script-task) to find out how scripts are used.

You can also use a script to create a _Monitor_, please take a look at the [monitors' documentation](../monitors.md#monitor-type-script) to see how scripts are used.

### Writing Scripts

TheEye will use the output from your scripts to determine whether or not the execution was successful. The last line of the scripts will be parsed looking for a string which represents a `state` or a `json` result object. So it is mandatory to indicate the execution status when writing scripts.

A `state` could be any state or event linked to the task or monitor of this script. Default build-in events are `success` and `failure`.

So if you script ended as expected \(success state\), you will have to make it print "success" as the last output line of your script.

* `success` when everythin is ok
* `failure` in abnormal situations

### Passing Arguments in Workflow.

There are different ways of passing arguments from monitor to task and from task to task.

#### Monitor to Task

In this case the state is always required or a failure will be assumed. There are two options to provide output:

* The first option is to print a JSON formatted string with two properties: state and data. data must be an array with the arguments list that need to be provided to the next triggered task in the workflow. Each index of the array will be mapped in order to each argument of the triggered task.

```bash

# do your things here...
if [ true ]; then
  echo { \"state\":\"success\", \"data\": [ \"val1\", \"val2\" ] }
else
  echo { \"state\":\"failure\", \"data\": [ \"val1\", \"val2\" ] }
fi

```

* The second option is similar to the first one, but we use an object in the data property instead of an array. The difference is that the object will be passsed untouch as the firt argument of the next task.

```bash

# do your things here...
if [ true ]; then
  echo { \"state\":\"success\", \"data\":{ \"val1\":$varTwo, \"val2\":$varUno }  }
else
  echo { \"state\":\"failure\" }
fi

```

#### Task to Task

This scenario is the same as the previous, but as the state is not explicitly required and can be ignored, the output is quite more simple. In task the output state is always "success", unless a "failure" is provided to stop the workflow.

Output can be an array (each index will be mapped to each argument of the triggered task):

```
  echo [\"arg1\",\"arg2\",\"arg3\"]
```

or an object (that will be the first argument of the triggered task):

```
  echo { \"val1\": $varTwo, \"val2\": $varUno }

```

#### Limitations.

The only detected limitation so far is the size of the string used as output. Dependeding on the operating system, the output buffer varies. Be aware that if the string exceded the output buffer, some characters can be lost, a json error will be arise (due to parsing errors) and the output of the monitor/task will be a failure. This situation can be detected analizing the output of the monitor or task.

#### Example

This is a simple check with `success` and `failure` states

```bash
# Some commands and checks here
# ...
# And at the end of the script...

if [ $check == true ]; then
  echo "success"
  exit
else
  echo "failure"
  exit
fi

# or you can keep doing more things, you can control the flow of your script and end it anytime
echo "success"
```

If you need to report extra information to the API, you'll have to print the information to the `stdout` in json format like this

```bash
varUno="value1"
varTwo="value2"

# This will output a valid JSON and will be parsed by TheEye agent
# Manually writing a JSON string is not quite pleasant, we know that and we will improve this in the future
if [ true ]; then
  echo { \"state\":\"success\", \"data\":{ \"val1\":$varTwo, \"val2\":$varUno } }
else
  echo { \"state\":\"failure\", \"data\":{ \"val1\":$varTwo, \"val2\":$varUno } }
fi
```

The JSON output must have a `state` property with a the state value from your script execution, and a `data` property with any extra information you consider, TheEye will show the `data` value in the execution log.

If you need to validate the JSON output of your scripts, you can use this simple nodejs script - there are also nice web sites that can validate JSON for you too. Change it for your case

`test_json.js`:

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
