/**
 * @namespace Language
 * @module En/Help
 */

const acl = 'Give permissions to specific users (or user emails) that will be able to execute tasks, see monitors state and receive notifications.'
const triggers = 'Select a task, monitor or webhook event that will trigger this task automagically.'
const grace_time = 'If you select to Trigger with an event, you can choose a grace time to delay the execution of this action and have some time to cancel it via email if necessary.'
const tags = 'Using Tags will help you to find your resources quickly'
const description = 'A description'
const timeout = 'How much time to wait the server\'s response before giving up. Default is 5 seconds.'
const method = 'The HTTP request Method.'
const remote_url = 'The remote API URL you want to call. Sometimes it is required to endcode it.'
const body = 'Here can add body parameters to the request. Only available for POST and PUT methods. Default is GET'
const gzip = 'Include the request header \'Accept-Encoding: gzip\'. This will improve transfer speed and bandwidth usage. Default is true.'
const json = 'Include the request header \'Content-type: application/json\'. Additionally, parses the response body as JSON. Default is false.'
const status_code = 'The response status code to consider the request success. Regular Expressions can be used. e.g. \'2[0-9][0-9]\' to match the group of 2XX status codes. Default value is 200.'
const pattern = 'Useful for matching a string or regular expression againts the HTTP response.'
const path = 'A path is where a file is located. It is composed of a dirname (directory) and a basename (filename + extension). Usage of absolute paths is recomended.'
const permissions = 'Permissions in octal format. Default is 0755'
const script_runas = 'Script interpreter and custom command. Use special "keyword" \'%script%\', it will be replaced during execution with the script path. In Unix this can be used with "sudo".'

export default {
  looptime: 'This is the check interval in minutes. The shorter the interval you choose, the more CPU and resource will consume.',
  description: 'We recomend to use a descriptions to improve teamwork and problem solving.',
  scripts: 'Select the script it has to execute.',
  script_arguments: 'Put here the list of fixed arguments. Separate each with comma',
  host: 'Where will the file be hosted?',
  tags: tags,
  acls: acl,
  triggers: triggers,
  severity: 'You can set a severity to this monitor, which can be LOW, HIGH or CRITICAL.',
  integrations: {
    logger: {
      enabled: 'Enable/Disable this integration',
      url: '<p>Remote API URL to submit the generated information in real time<br><br>The URL querystring admits two option extra parameters that will be replaced during the Remote invocation. <ul><li>%topic%</li><li>%date%</li></ul><br>Example usage: "https://yourremote.io/%topic%/%date%"</p>'
    }
  },
  indicator: {
    description,
    acl,
    tags,
    title: 'A descriptive and unique text for the Indicator. Should be unique, it can be used as index to easily reference it via API',
    _type: 'Defines the indicator visualization',
    value: 'Initial value. It can changed later.',
    read_only: 'When false, it can be dismissed from the Home'
  },
  monitor: {
    description,
    acl,
    tags,
    monitors: 'Add or remove monitors',
    name: 'Give this monitor a name',
    process: 'The running system process to search for',
    copy: 'Use another monitor setup to copy',
    sfailure_everity: 'Set the severity to HIGH or CRITICAL to receive notifications',
    wizard: {
      nested: 'Notify when all the monitors inside the group needs attention',
      health: 'Checks the BOT\'s host running status',
      processes: 'Collects the BOT\'s host running processes',
      script: 'Create a script based monitor',
      scraper: 'Check the answer of a web request',
      process: 'Verify if a process in the host machine is running',
      file: 'Create a monitor for a file'
    },
    form: {
      name: 'Give this monitor a name',
      description: description,
      host_id: 'A registered Bot',
      hosts: 'One or more Bots can be selected',
      script_id: 'Select a file',
      tags: tags,
      timeout: timeout,
      method: method,
      remote_url: remote_url,
      path_input: 'Indicate the target directory to store the file. Check "Custom Filename" to create the file with the desired filename.',
      dirname: 'The directory to store the file',
      basename: 'The name of the file, usually with the extension.',
      body: body,
      gzip: gzip,
      json: json,
      status_code: status_code,
      pattern: pattern,
      acl: acl,
      copy: 'Select the monitor you want to copy from',
      looptime: 'Select the check interval in minutes. The shorter the interval, the more CPU and resource usage.',
      path: path,
      os_username: 'The system username for the file',
      os_groupname: 'The system groupname for the file',
      permissions: permissions,
      is_regexp: 'Use a regular expression to match a process',
      process: 'Process to search for',
      failure_severity: 'You can set a severity to this monitor, which can be LOW, HIGH or CRITICAL',
      cpu: 'An alert will be fired at this CPU usage percentage',
      disk: 'An alert will be fired at this Disk usage percentage',
      swap: 'An alert will be fired at this Cache memory usage percentage',
      mem: 'An alert will be fired at this Memory usage percentage',
      script_runas,
      script_arguments: 'Put here a comma separated list of arguments',
      monitors: 'Select the monitors you want to observe'
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
      tags: tags,
      timeout: timeout,
      method: method,
      remote_url: remote_url,
      body: body,
      gzip: gzip,
      json: json,
      status_code: status_code,
      pattern: pattern,
      acl: acl,
      dirname: 'The directory to store the file',
      basename: 'The name of the file, usually with the extension.',
      triggers: triggers,
      grace_time: grace_time,
      task_arguments: 'Task arguments',
      copy_task: 'Select the task you want to copy from',
      script_id: 'Scripts are sets of instructions writen in a programming language to achive something automatically',
      script_timeout: 'Time to wait before the task is killed. Default timeout is 5 minutes.',
      script_runas,
      env: 'Set environment variables during script execution. Use a JSON object key:value format',
      multitasking: 'Allowes Bots to run multiple instances of this Task in parallel',
      arguments_type: 'Choose Json formatting to standarize the data received from the UI',
      approval_task_arguments: 'Data submitted by the approval request (from previous task)',
      show_result: 'Show job result popup on finish.',
      user_inputs: 'Demands a user to fill the input arguments. Cannot be automatilly executed and always required manual intervention.'
    },
    cannot_schedule: 'A Scheduled Task cannot have dynamic input/select arguments',
    cannot_trigger: 'A Task with dynamic arguments cannot be automatically triggered by Workflow',
    export_backup: '<b>Backup</b>: Export task template, including fixed arguments and environment variables.<br/><b>Keep this recipe safe, to avoid private data leaks and keys exposure</b>',
    export_recipe: '<b>Recipe</b>: Create task template. Values for fixed arguments and environment variables will be empty.',
    export_arguments: '<b>Arguments</b>: Export task arguments only. Values for fixed arguments will be empty.'
  },
  workflow: {
    export_deep: '<b>Deep Export</b>: Export the workflow for backup. It will include fixed arguments, environment variables, script references, acls, etc.<br/><b>Keep this recipe safe, to avoid private data leaks and keys exposure</b>',
    export_shallow: '<b>Shallow Export</b>: Export the workflow for sharing or reusing in other organizations. Values for fixed arguments, environment variables, acls, hosts will be empty.'
  },
  job: {
    repeat: 'Start a new job using the same inputs',
    repeat_edit: 'Start a new job like this, but allow me to edit the arguments',
    restart: 'Retry this job keeping the inputs and the environment',
    restart_edit: 'Retry this job, but allow me to edit the arguments',
    change_assignee: 'Change this job\'s assignees'
  },
  file: {
    path,
    permissions,
    dirname: 'The directory to store the file',
    basename: 'The name of the file, usually with the extension.',
    uid: 'The user id for the file',
    gid: 'The group id for the file',
    select: 'Select a file',
    form: {
      filename: 'Filename with extension. Extension is used to determine editor interpreter',
      description: 'more information about your script',
      script: 'Load your scripts. You can also drop it in this window.'
    }
  },
  titles: {
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
      source_host: 'Select a properly configured Host to create the Template.',
    },
    regexp_search: 'All this Bots match the regular expression. If you don\'t add them to the template they will be ignored. To include all this Bots into the Template click on <b style="color:#337ab7">Add All</b>'
  },
  scheduler: {
    taskform: {
      datetime: 'Pick a date in which this task will be executed first',
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
