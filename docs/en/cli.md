# CLI Util

[![theeye.io](./images/logo-theeye-theOeye-logo2.png)](https://theeye.io/en/index.html)

## How to use the CLI

The CLI is a command line utility based on the Agent Core. Basically the CLI allows you to perform authenticated requests to the API and create custom clients or automated tasks from any command line shell.

The CLI accepts the same environment variables as the agent.

* DEBUG
* NODE\_ENV
* THEEYE\_CLIENT\_HOSTNAME
* THEEYE\_SUPERVISOR\_API\_URL
* THEEYE\_SUPERVISOR\_CLIENT\_ID
* THEEYE\_SUPERVISOR\_CLIENT\_SECRET
* THEEYE\_SUPERVISOR\_CLIENT\_CUSTOMER
* THEEYE\_AGENT\_SCRIPT\_PATH
* http\_proxy
* https\_proxy

It also works with the agent configuration file.

A simple example

```bash
 /opt/theeye-agent/> ./cli/theeye-cli.js --help

  Usage: theeye-cli [options]

  Options:

    -h, --help                                     output usage information
    -V, --version                                  output the version number
    -a, --action [create|get|update|patch|remove]  Resource action
    -r, --resource [name]                          Remote resource name
    -p, --path [path]                              Full remote resource path
    -b, --body [jsonText]                          Request body params in json format
    -q, --query [jsonText]                         Request query string in json format
```

The following command will fetch all your available monitors

`NODE_ENV=cfgfilename ./cli/theeye-cli.js -a get -r resource`

Note: You will be able to perform only authorized actions to the user you are using \(check configuration options\). Agents for example, have limited permissions. To perform advanced actions \(like create, delete or update\) you will need a user with admin or higher permissions.

