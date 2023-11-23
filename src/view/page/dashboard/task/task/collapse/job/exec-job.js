import App from 'ampersand-app'
import Acl from 'lib/acls'
import bootbox from 'bootbox'
import DynamicForm from 'view/dynamic-form'
import Modalizer from 'components/modalizer'
import { ExecTask, BaseExec } from '../../exec-task.js'
import * as FIELD from 'constants/field'
import * as ComponentConstants from 'constants/component'
import moment from 'moment'
import isURL from 'validator/lib/isURL'
import * as JobConstants from 'constants/job'
import * as LifecycleConstants from 'constants/lifecycle'
import { ValueOption as ArgumentValueOption } from 'models/task/dynamic-argument'
import ConfirmExecution from '../../confirm-execution'

export const RepeatCompletedJob = BaseExec.extend({
  execute () {
    const job = this.model
    prepareArguments(job, (args) => {
      const action = new ExecTask({ model: job.task })
      action._confirmExecution(args)
    })
  }
})

export const RestartCompletedJob = BaseExec.extend({
  execute () {
    const job = this.model
    if (job.isCompleted) {
      prepareArguments(job, (args) => {
        retryJob(job, args)
      })
    }
  }
})

export const ExecOnHoldJob = BaseExec.extend({
  execute (done) {
    if (this.model.lifecycle === LifecycleConstants.ONHOLD) {
      if (this.model._type === JobConstants.APPROVAL_TYPE) {
        this.controlApprovalRequest(done)
      } else {
        this.requestInput(done)
      }
    }
  },
  controlApprovalRequest (done) {
    if (this.model.isApprover(App.state.session.user)) {
      this.requestApproval(done)
    } else if (Acl.hasAccessLevel('admin')) {
      this.changeApprovalRequest(done)
    } else {
      bootbox.alert({
        message: `Waiting approvals <br/><br/>${escapeHtml(this.model.approversUsers.toString())}`,
        backdrop: true
      })
    }
  },
  requestApproval (done) {
    done || (done = () => {})

    let message = buildApprovalMessage(this.model)
    let args = this.model.task_arguments_values
    const orders = Object.keys(args)
    const jobArgs = orders.map((order) => {
      return {
        order: parseInt(order),
        label: this.model.taskModel.task_arguments.get(parseInt(order), 'order').label,
        value: args[order],
        type: this.model.taskModel.task_arguments.get(parseInt(order), 'order').type
      }
    })

    const buttons = {
      reject: {
        label: this.model.task.failure_label ||'Reject',
        className: 'btn btn-danger',
        callback: () => {
          App.actions.job.reject(this.model, jobArgs)
          done()
        }
      },
      approve: {
        label: this.model.task.success_label || 'Approve',
        className: 'btn btn-primary',
        callback: () => {
          App.actions.job.approve(this.model, jobArgs)
          done()
        }
      }
    }

    if (
      this.model.task.cancellable !== false &&
      this.model.task.cancel_enabled === true &&
      this.model.task.cancel_label !== ''
    ) {
      buttons.cancel = {
        label: this.model.task.cancel_label || 'Cancel',
        className: 'btn btn-default',
        callback: () => {
          bootbox.confirm({
            message: 'Cancel approval request?',
            backdrop: true,
            buttons: {
              cancel: {
                label: 'No'
              },
              confirm: {
                label: 'Yes, please',
                className: 'btn-danger'
              }
            },
            callback: (confirmed) => {
              if (confirmed) {
                App.actions.job.cancel(this.model)
              }
              done()
            }
          })
        }
      }
    }

    if (this.model.task.ignore_enabled === true && this.model.task.ignore_label !== '') {
      buttons.skip = {
        label: this.model.task.ignore_label || 'Ignore',
        className: 'btn btn-default',
        callback: () => {
          //App.actions.onHold.skip(this.model)
          done()
        }
      }
    }

    bootbox.dialog({
      message: message,
      backdrop: true,
      closeButton: false,
      buttons
    })
  },
  changeApprovalRequest (done) {
    bootbox.confirm({
      message: 'Cancel the approval request?',
      backdrop: true,
      closeButton: false,
      buttons: {
        confirm: {
          label: 'Yes, please',
          className: 'btn-danger'
        },
        cancel: {
          label: 'No'
        }
      },
      callback: cancel => {
        if (cancel === true) {
          App.actions.job.cancel(this.model)
        }
        done && done()
      }
    })
  },
  requestInput (done) {
    done || (done=()=>{})
    this.getDynamicArguments((jobArgs, canceled) => {
      if (canceled) {
        if (this.model.task.cancellable !== false || Acl.hasAccessLevel('admin')) {
          // ask confirmation
          bootbox.confirm({
            message: 'Do you want to cancel the execution?',
            backdrop: true,
            buttons: {
              cancel: {
                label: 'No'
              },
              confirm: {
                label: 'Yes',
                className: 'btn-danger'
              }
            },
            callback: (confirmed) => {
              if (confirmed) {
                App.actions.job.cancel(this.model)
              }
              done()
            }
          })
        } else {
          return done()
        }
      } else {
        if (jobArgs !== null) {
          App.actions.job.submitInputs(this.model, jobArgs)
        }
        return done()
      }
    })
  },
  getDynamicArguments (next) {
    let taskModel = this.model.task.serialize()
    delete taskModel.id
    const task = new App.Models.Task.Factory(taskModel)
    if (this.model.user_inputs) {
      // check previous job result for components. only workflow
      this.checkComponents(task)
    }

    const form = new DynamicForm({ fieldsDefinitions: task.task_arguments.models })
    const modal = new Modalizer({
      closeButton: false,
      buttons: true,
      confirmButton: 'Continue',
      cancelButton: (this.model.task.cancellable === false ? "Close" : "Cancel"),
      title: `${task.name}`,
      bodyView: form
    })


    this.listenTo(modal, 'hidden', () => {
      form.remove()
      modal.remove()
    })

    this.listenTo(modal, 'cancel', () => {
      next(null, true)
    })

    this.listenTo(modal, 'close', () => {
      modal.hide()
      next(null)
    })

    this.listenTo(modal, 'confirm', () => {
      /**
      * @param {Object} args a {key0: value0, key1: value1, ...} object with each task argument
      */
      form.submit((err, args) => {
        const orders = Object.keys(args)
        const taskArgs = []
        orders.forEach(order => {
          taskArgs.push({
            order: parseInt(order),
            label: task.task_arguments.get(parseInt(order), 'order').label,
            value: args[order],
            type: task.task_arguments.get(parseInt(order), 'order').type,
            masked: task.task_arguments.get(parseInt(order), 'order').masked
          })
        })

        modal.hide()
        //next(this.parseArgs(taskArgs))
        next(taskArgs)
      })
    })

    modal.show()
    return modal
  },
  checkComponents (task) {
    if (!this.model.workflow_job_id) { return } // task is not in workflow

    // get previous job
    const workflowJob = App.state.jobs.get(this.model.workflow_job_id)
    if (!workflowJob) { return } // workflow is not populated.

    // get previous job components
    const previousJob = workflowJob.previousJob
    if (previousJob?.components) {
      const components = previousJob.components
      for (let componentName in components) {
        ComponentFactory(componentName, components[componentName], task)
      }
    }
  }
})

const ComponentsMap = {}
ComponentsMap[ComponentConstants.INPUT_OPTIONS] = function (componentData, task) {
  if (componentData && Array.isArray(componentData) && componentData.length > 0) {
    componentData.forEach((optionsComponent) => {
      if (optionsComponent.order && Array.isArray(optionsComponent.options)) {
        let taskArgument = task.task_arguments.models[optionsComponent.order-1]
        if (taskArgument && taskArgument.type === FIELD.TYPE_SELECT) {
          // set options
          taskArgument.options.set()
          optionsComponent.options.forEach((option, i) => {
            option.order = i + 1
            let optionModel = new ArgumentValueOption(option)
            taskArgument.options.add(optionModel)
          })
        }
      }
    })
  }
}

ComponentsMap[ComponentConstants.INPUT_REMOTE_OPTIONS] = function (componentData, task) {
  if (componentData && Array.isArray(componentData) && componentData.length > 0) {
    componentData.forEach((remoteOptionsComponent) => {
      if (remoteOptionsComponent.order) {
        let taskArgument = task.task_arguments.models[remoteOptionsComponent.order-1]
        if (taskArgument && taskArgument.type === FIELD.TYPE_REMOTE_OPTIONS) {
          // set remote options
          if (remoteOptionsComponent.endpointUrl) taskArgument.endpoint_url = remoteOptionsComponent.endpointUrl
          if (remoteOptionsComponent.idAttribute) taskArgument.id_attribute = remoteOptionsComponent.idAttribute
          if (remoteOptionsComponent.textAttribute) taskArgument.text_attribute = remoteOptionsComponent.textAttribute
        }
      }
    })
  }
}

const ComponentFactory = (name, options, task) => {
  const ComponentHandler = ComponentsMap[name]
  if (!ComponentHandler) {
    return
  }
  ComponentHandler(options, task)
}

const buildApprovalMessage = (model) => {
  let params = model.task.task_arguments
  let values = model.task_arguments_values
  let message = `<p>Task <b>${model.name}</b> needs your action to continue.</p>`


  let msg = model.task.approval_message || 'Please verify the following information:'
  if (params.length) {
    message += `<br><p><b>${msg}</b></p><br>`
  }

  params.forEach(function (param, index) {
    let line = `<p>${param.label}: `
    let value = values[index]
    switch (param.type) {
      case FIELD.TYPE_FIXED:
      case FIELD.TYPE_INPUT:
        if (value && typeof value === 'string' && isURL(value)) {
          line += `<a href='${value}' download='file${index + 1}' target='_blank'>Download</a>`
        } else {
          line += value
        }
        break
      case FIELD.TYPE_DATE:
        line += moment(value).format('D-MMM-YY, HH:mm:ss')
        break
      case FIELD.TYPE_FILE:
        line += `<a href='${value}' download='file${index + 1}' target='_blank'>Download</a>`
        break
      case FIELD.TYPE_SELECT:
        break
      case FIELD.TYPE_REMOTE_OPTIONS:
        break
      default:
    }
    line += '</p>'
    message += line
  })

  return message
}

const escapeHtml = (html) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return html.replace(/[&<>"']/g, function(m) { return map[m]; });
}

const prepareArguments = (job, next) => {
  job.once('inputs-ready', () => {
    const task = job.task
    const args = []

    if (task.task_arguments.models && job.task_arguments_values) {
      for (let arg of task.task_arguments.models) {
        args.push({
          value: job.task_arguments_values[ arg.order ],
          order: parseInt(arg.order),
          label: arg.label,
          type: arg.type,
          masked: arg.masked
        })
      }

      next(args)
    }
  })

  App.actions.job.fetchInputs([job])
}

const retryJob = (job, args) => {
  let confirmView = new ConfirmExecution({
    message: `retry job ${job.id}`,
    taskArgs: args
  })

  const modal = new Modalizer({
    buttons: true,
    confirmButton: 'Restart',
    title: `Restarting job ${job.id}`,
    bodyView: confirmView
  })

  modal.on('hidden', () => {
    confirmView.remove()
    modal.remove()
  })

  modal.on('confirm', () => {
    modal.hide()
    App.actions.job.restart(job, args)
  })

  modal.show()
}
