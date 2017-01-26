
var HelpTexts = {
  looptime: 'Select the check interval in minutes. The shorter the interval, the more CPU and resource usage.',
  description: 'Use descriptions to improve teamwork and problem solving.',
  scripts: 'Which script it has to run?',
  script_runas: 'Run the selected script using a different username. Use \'%script%\' reserved word to include the script, this will be replaced during execution time with the real script path. Windows users, requires to mimic this action putting the password for the first time.',
  script_arguments: 'Put here a comma separated list of arguments.',
  host: 'Where it has to run?',
  tags: 'To help you find your resources quickly.',
  triggers: 'Select a task, monitor or webhook event that will trigger this task automagically.',
  grace_time: 'If you select to Trigger on an event, you can select to delay the execution that allows you to cancel this action via email.',
  monitor: {
    name: 'Give this monitor a name',
    process: 'Which process it has to search for?'
  },
  task: {
    name: 'Give this task a name',
  }
}
