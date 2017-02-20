
var HelpTexts = {
  looptime: 'Select the check interval in minutes. The shorter the interval, the more CPU and resource usage.',
  description: 'Use descriptions to improve teamwork and problem solving.',
  scripts: 'Which script it has to run?',
  script_runas: 'Run the selected script using a different username. Use \'%script%\' reserved word to include the script, this will be replaced during execution time with the real script path. Windows users, requires to mimic this action putting the password for the first time.',
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
    user_page: 'user_page_title_help',
    task_page: 'task_page_title_help',
    script_page: 'script_page_title_help',
    customer_page: 'customer_page_title_help',
    monitor_page: 'monitor_page_title_help',
    webhook_page: 'webhook_page_title_help',
    template_page: 'template_page_title_help',
  },
}
