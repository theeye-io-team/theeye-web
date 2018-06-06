import ExecButton from '../exec-button'
const runTaskWithArgsMessage = require('./run-task-message.hbs')
import App from 'ampersand-app'
import bootbox from 'bootbox'
import JobActions from 'actions/job'
const logger = require('lib/logger')('page:dashboard:task:exec-button')
import LifecycleConstants from 'constants/lifecycle'

import DinamicForm from 'components/dinamic-form'
import Modalizer from 'components/modalizer'

export default function (options) {
  if (options.model.type === 'approval') {
    return new ExecApprovalTaskButton(options)
  } else {
    return new ExecTaskButton(options)
  }
}

const ExecTaskButton = ExecButton.extend({
  getDinamicArguments (next) {
    if (this.model.hasDinamicArguments) {
      const form = new DinamicForm ({
        fieldsDefinitions: this.model.task_arguments.models
      })

      const modal = new Modalizer({
        buttons: true,
        confirmButton: 'Run',
        title: `Run ${this.model.name} with dynamic arguments`,
        bodyView: form
      })

      this.listenTo(modal,'shown',() => { form.focus() })

      this.listenTo(modal,'hidden',() => {
        form.remove()
        modal.remove()
      })

      this.listenTo(modal,'confirm',() => {
        /**
         * @param {Object} args a {key0: value0, key1: value1, ...} object with each task argument
         */
        form.submit( (err,args) => {
          const orders = Object.keys(args)
          next(
            orders.map( (order) => {
              return {
                order: parseInt(order),
                label: this.model.task_arguments.get(parseInt(order),'order').label,
                value: args[order],
                type: this.model.task_arguments.get(parseInt(order),'order').type
              }
            })
          )
          modal.hide()
        })
      })
      modal.show()
    } else {
      next([])
    }
  },
  execute () {
    if (this.model.lastjob.inProgress) {
      const message = `Cancel <b>${this.model.name}</b> the execution of this task?
        <a target="_blank" href="https://github.com/theeye-io/theeye-docs/blob/master/tasks/cancellation">Why this happens?</a>`

      bootbox.confirm({
        message: message,
        backdrop: true,
        callback: (confirmed) => {
          if (confirmed) {
            JobActions.cancel(this.model.lastjob)
          }
        }
      })
    } else {
      if (!this.model.canExecute) return

      let reporting = this.model.hostIsReporting()
      if (reporting === null) return  /// cannot find the resource for this task
      if (reporting === false) {
        bootbox.confirm({
          message: `
          <h2>At this moment the host that runs this task is not reporting.</h2>
          <h2>Would you like to queue this task for running when the host is restored?</h2>
          `,
          backdrop: true,
          callback: (confirmed) => {
            if (confirmed) this._confirmExecution()
          }
        })
      } else this._confirmExecution()
    }
  },
  onClickExecute (event) {
    event.stopPropagation()
    event.preventDefault()
    this.execute()
    return false
  },
  _confirmExecution () {
    this.getDinamicArguments(taskArgs => {
      let message
      if (taskArgs.length>0) {
        taskArgs.forEach(function(arg) {
          switch (arg.type) {
            case 'date':
              if(Array.isArray(arg.value) && arg.value.length == 1) {
                arg.value = arg.value[0]
                arg.renderValue = arg.value
              }
              break;
            case 'file':
              arg.value = arg.value.dataUrl
              arg.renderValue = arg.value.name
              break;
            default:
              arg.renderValue = arg.value
              break;
          }
        })

        message = runTaskWithArgsMessage({
          name: this.model.name,
          args: taskArgs
        })
      } else {
        message = `
          <h2>You are about to run the task <b>${this.model.name}</b></h2>
          <h2>Continue?</h2>
          `
      }

      bootbox.confirm({
        message: message,
        backdrop: true,
        callback: (confirmed) => {
          if (confirmed) {
            JobActions.createFromTask(this.model, taskArgs)
          }
        }
      })
    })
  },
  render () {
    ExecButton.prototype.render.apply(this, arguments)
    this.listenTo(this.model, 'execution', () => {
      this.execute()
    })
  }
})

const ExecApprovalTaskButton = ExecTaskButton.extend({
  execute () {
    if (this.model.lastjob.inProgress) {
      if (this.model.approver_id === App.state.session.user.id) {
        this.getDinamicArguments(taskArgs => {
          const message = `Approve/Reject?`
          bootbox.dialog({
          message: message,
          backdrop: true,
          buttons: {
            reject: {
              label: 'Reject',
              className: 'btn btn-danger',
              callback: () => {
                JobActions.reject(this.model.lastjob, taskArgs)
              }
            },
            approve: {
              label: 'Approve',
              className: 'btn btn-primary',
              callback: () => {
                JobActions.approve(this.model.lastjob, taskArgs)
              }
            }
          }
          })
        })
      } else {
        const message = `The Approval request is pending. What do you want to do?`

        bootbox.dialog({
          message: message,
          backdrop: true,
          buttons: {
            cancel: {
              label: 'Cancel request',
              className: 'btn btn-danger',
              callback: () => {
                JobActions.cancel(this.model.lastjob)
              }
            },
            resend: {
              label: 'Resend request',
              className: 'btn btn-primary',
              callback: () => {
                JobActions.createFromTask(this.model, [])
              }
            }
          }
        })
      }
    } else {
      JobActions.createFromTask(this.model, [])
    }
  }
})
