/**
 * @namespace Language
 * @module En/Help
 */
module.exports = {
  looptime: 'This is the check interval in minutes. The shorter the interval you choose, the more CPU and resource will consume.',
  description: 'We recomend to use a descriptions to improve teamwork and problem solving.',
  scripts: 'Select the script it has to execute.',
  script_runas: 'Execute the selected script using a different username. You have to use \'%script%\' in the place where the script has to be included. This "keyword" will be replaced during execution with the real script path. This is the perfect place to use "sudo". Windows users, requires to mimic this action putting the password for the first time.',
  script_arguments: 'Put here a comma separated list of arguments.',
  host: 'Where it has to run?',
  tags: 'To help you find your resources quickly.',
  triggers: 'Select a task, monitor or webhook event that will trigger this task automagically.',
  grace_time: 'If you select to Trigger with an event, you can choose a grace time to delay the execution of this action and have some time to cancel it via email if necessary.',
  acls: 'Add permissions to specific users (or emails) that will be able to execute this task and receive notifications.',
  severity: 'You can set a severity to this monitor, which can be LOW, HIGH or CRITICAL.',
  request: {
    timeout:'How much time to wait the server\'s response before giving up. Default is 5 seconds.',
    method: 'Select the request Method.',
    url: 'The URL of the service, remember to encode it.',
    body: 'Here can add body parameters to the request. Only available for POST and PUT methods. Default is GET',
    gzip:'Enable HTTP compression to improve transfer speed and bandwidth utilization. An \'Accept-Encoding: gzip\' header will be added to the request. Default is true.',
    json:'Tells the server that the data being transferred is actually JSON. A \'Content-type: application/json\' header will be added to the request. Additionally, parses the response body as JSON. Default is false.',
    status_code:'The expected status code that will be considered ok. Regular Expressions can be used to match a status, for example \'2[0-9][0-9]\' will match 2XX codes in the Success group. Default value is 200.',
  },
  scraper_pattern: 'Could be a String or Regular Expression, also could be part of the response, that we have to considered ok.',
  monitor: {
    name: 'Give this monitor a name',
    process: 'Which process it has to search for?',
    copy: 'Select the monitor you want to copy from'
  },
  task: {
    name: 'Give this task a name',
    copy: 'Select the task you want to copy from'
  },
  file: {
    path: 'The full path to put the file in',
    uid: 'The user id for the file',
    gid: 'The group id for the file',
    permissions: 'Permissions in octal format. Default is 0755',
    select: 'Select a file'
  },
  titles:{
    user_page: 'Users CRUD operations',
    customer_page: 'Customers CRUD operations',
    script_page: 'Tasks/Monitors Scripts CRUD operations',
    task_page: 'Tasks allow\'s you to run Web/APi requests and custom scripts. You can then schedule the tasks.',
    monitor_page: 'Monitors watches your Web/API endpoints, files, processes, hosts health and scripts changes and send alerts to You.',
    webhook_page: 'Webhooks allows you to Trigger tasks automagically, through requests from outside applications.',
    hostgroup_page: 'Templates allows you to group hosts, and give them the same monitors and tasks. Also use Templates for Auto-Provisioning of new hosts.',
  },
  hostgroup: {
    form: {
      name: 'Give this template a name',
      description: 'Use a description to improve teamwork an usability',
      hostname_regex: 'Use a Regular Expression if you want the auto provisioning features. You can test the Regular Expression by using the "Search..." button',
      hosts: 'Select the Hosts you want to include in this Template. [Warning] Existent hosts won\'t be included in the Template unless you choose them. [Tip] You can use the "Search..." button',
      copy_host: 'Select a properly configured host to create the Template.',
    },
    regexp_search: 'All this hosts match the regular expression. If you don\'t add them to the template they will be ignored. To include all this hosts into the Template click on <b style="color:#337ab7">Add All</b>'
  }
}
