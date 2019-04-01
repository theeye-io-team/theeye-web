/**
 * @namespace Language
 * @module En/Help
 */

const acl = 'Give permissions to specific users (or user emails) that will be able to execute tasks, see monitors state and receive notifications.'
const triggers = 'Select a task, monitor or webhook event that will trigger this task automagically.'
const grace_time = 'If you select to Trigger with an event, you can choose a grace time to delay the execution of this action and have some time to cancel it via email if necessary.'
const tags = 'Using Tags will help you to find your resources quickly'
const description = 'A description'

module.exports = {
  looptime: 'This is the check interval in minutes. The shorter the interval you choose, the more CPU and resource will consume.',
  description: 'We recomend to use a descriptions to improve teamwork and problem solving.',
  scripts: 'Select the script it has to execute.',
  script_arguments: 'Put here a comma separated list of arguments.',
  host: 'Where will the file be hosted?',
  tags: tags,
  acls: acl,
  triggers: triggers,
  severity: 'You can set a severity to this monitor, which can be LOW, HIGH or CRITICAL.',
  monitor: {
    monitors: 'Add or remove monitors',
    name: 'Give this monitor a name',
    description: description,
    acl: acl,
    tags: tags,
    process: 'The running system process to search for',
    copy: 'Use another monitor setup to copy',
    sfailure_everity: 'Set the severity to HIGH or CRITICAL to receive notifications',
    wizard: {
      nested: 'Create a monitor to notify when all the monitors inside it needs attention',
      others: 'Go to Monitors page'
    },
    unmute_button: 'Unmute notifications',
    mute_button: 'Mute notifications'
  },
  task: {
    creation: {
      webhook: 'Select Outgoing Webhook to execute a HTTP requests i.e. to call a remote api method',
      script: 'Select Script to accomplish your task automation',
      approval: 'Select Approval to give someone control over Workflow execution',
      notification: 'Select Notification to send push or email from inside Workflows or triggered by Tasks',
      dummy: 'Select Input to request for mandatory values before start the Workflow execution'
    },
    form: {
      name: 'Give this task a name',
      description: 'A description',
      host_id: 'A registered Bot',
      hosts: 'One or more Bots can be selected',
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
      task_arguments: 'Task arguments',
      copy_task: 'Select the task you want to copy from',
      script_runas: 'Execute the selected script using a different username. You have to use \'%script%\' in the place where the script has to be included. This "keyword" will be replaced during execution with the real script path. This is the perfect place to use "sudo". Windows users, requires to mimic this action putting the password for the first time.',
      approval_task_arguments: 'Data submitted by the approval request (from previous task)',
      approval_output_parameters: 'Data submitted by the approver (for next task)'
    },
    cannot_schedule: 'A Scheduled Task cannot have dynamic input/select arguments',
    cannot_trigger: 'A Task with dynamic arguments cannot be automatically triggered by Workflow',
  },
  file: {
    path: 'The full path to put the file in',
    uid: 'The user id for the file',
    gid: 'The group id for the file',
    permissions: 'Permissions in octal format. Default is 0755',
    select: 'Select a file',
    state: "Error Handling. Print 'fail', 'failure' or 'error' for unsuccessful execution.",
    shebang: 'Keep in mind that the  shebang (#!) is required when writing a Linux/Unix script.',
    //env: 'Workflow. You can get the result of the previous task execution by inquiring the env variable THEEYE_WF_LASTLINE. Check in advance that the env variable THEEYE_WF is defined'
    env: 'Workflow. You can get the result of the previous task execution by inquiring the env variable THEEYE_WF_LASTLINE.'
  },
  titles:{
    user_page: 'Users CRUD operations',
    customer_page: 'Customers CRUD operations',
    file_page: 'Scripts and Files CRUD operations',
    task_page: 'Tasks allow\'s you to run Web/APi requests and custom scripts. You can then schedule the tasks.',
    monitor_page: 'Monitors watches your Web/API endpoints, files, processes, hosts health and scripts changes and send alerts to You.',
    webhook_page: 'Webhooks allows you to Trigger tasks automagically, through requests from outside applications.',
    hostgroup_page: 'Templates allows you to group Bots, and give them the same monitors and tasks. Also use Templates for Auto-Provisioning of new Bots.',
  },
  hostgroup: {
    form: {
      name: 'Give this template a name',
      description: 'Use a description to improve teamwork an usability',
      hostname_regex: 'Use a Regular Expression if you want the auto provisioning features. You can test the Regular Expression by using the "Search..." button',
      hosts: 'Select the Bots you want to include in this Template. [Warning] Existent Bots won\'t be included in the Template unless you choose them. [Tip] You can use the "Search..." button',
      copy_host: 'Select a properly configured Bot to create the Template.',
    },
    regexp_search: 'All this Bots match the regular expression. If you don\'t add them to the template they will be ignored. To include all this Bots into the Template click on <b style="color:#337ab7">Add All</b>'
  },
  scheduler: {
    taskform: {
      datetime: 'pick-a-date',
      frequency: 'Use a "human interval" expression like "1 hour", "3 days", "2 weeks", etc... Leave empty for no repetition'
    }
  },
  onboarding: {
    installer: 'Show installer tutorial.',
    task: 'Show task tutorial.',
    script: 'Show script tutorial'
  },
  settings: {
    installer: {
      autobot: 'We can start a Bot for you'
    }
  }
}
