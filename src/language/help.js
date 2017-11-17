/**
 * @namespace Language
 * @module En/Help
 */

const acl = 'Add permissions to specific users (or emails) that will be able to execute this task and receive notifications.'
const triggers = 'Select a task, monitor or webhook event that will trigger this task automagically.'
const grace_time = 'If you select to Trigger with an event, you can choose a grace time to delay the execution of this action and have some time to cancel it via email if necessary.'

module.exports = {
  looptime: 'This is the check interval in minutes. The shorter the interval you choose, the more CPU and resource will consume.',
  description: 'We recomend to use a descriptions to improve teamwork and problem solving.',
  scripts: 'Select the script it has to execute.',
  script_arguments: 'Put here a comma separated list of arguments.',
  host: 'Where it has to run?',
  tags: 'To help you find your resources quickly.',
  acls: acl,
  triggers: triggers,
  severity: 'You can set a severity to this monitor, which can be LOW, HIGH or CRITICAL.',
  monitor: {
    name: 'Give this monitor a name',
    process: 'Which process it has to search for?',
    copy: 'Select the monitor you want to copy from'
  },
  task: {
    creation: {
      webhook: 'Select Outgoing Webhook to execute a HTTP requests i.e. to call a remote api method',
      script: 'Select Script to accomplish your task automation'
    },
    form: {
      name: 'Give this task a name',
      description: 'A description',
      host_id: 'A registered host',
      hosts: 'One or more hosts can be selected',
      script_id: 'Scripts are sets of instructions writen in a programming language to achive something automatically',
      tags: 'Adding Tags will help to search and group',
      timeout: 'How much time to wait the server\'s response before giving up. Default is 5 seconds.',
      method: 'The HTTP request Method.',
      remote_url: 'The remote API URL you want to call. Sometimes it is required to endcode it.',
      body: 'Here can add body parameters to the request. Only available for POST and PUT methods. Default is GET',
      gzip: 'Include the request header \'Accept-Encoding: gzip\'. This will improve transfer speed and bandwidth usage. Default is true.',
      json: 'Include the request header \'Content-type: application/json\'. Additionally, parses the response body as JSON. Default is false.',
      status_code: 'The response status code to consider the request success. Regular Expressions can be used. e.g. \'2[0-9][0-9]\' to match the group of 2XX status codes. Default value is 200.',
      pattern: 'Useful for matching a string or regular expression againts the HTTP response.',
      acl: acl,
      triggers: triggers,
      grace_time: grace_time,
      taskArguments: 'Task arguments',
      copy_task: 'Select the task you want to copy from',
      script_runas: 'Execute the selected script using a different username. You have to use \'%script%\' in the place where the script has to be included. This "keyword" will be replaced during execution with the real script path. This is the perfect place to use "sudo". Windows users, requires to mimic this action putting the password for the first time.',
    },
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
  },
  scheduler: {
    taskform: {
      datetime: 'pick-a-date',
      frequency: 'Use a "human interval" expression like "1 hour", "3 days", "2 weeks", etc... Leave empty for no repetition'
    }
  }
}
