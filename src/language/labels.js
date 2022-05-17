
export default {
  env: 'Environment Variable',
  task_arguments: 'Input Arguments',
  host_id: 'Host',
  remote_url: 'URL',
  script_id: 'Script',
  script_runas: 'Intepreter (runas)',
  page: {
    task: {
      form: {
        approval: {
          target_initiator: 'Workflow Initiatior',
          target_assignees: 'Workflow Assignee (Must be assigned programatically when the Process is initiated via API or by a Bot)',
          target_dynamic: 'Dynamically determined in the previous task',
          target_fixed: 'Specific Approvers (Choose below)'
        },
        allows_behaviour_change: 'Allows to change the behaviour of running jobs'
      },
    }
  }
}
