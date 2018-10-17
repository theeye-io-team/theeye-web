import App from 'ampersand-app'
import State from 'ampersand-state'
const runTaskWithArgsMessage = require('./run-task-message.hbs')
import bootbox from 'bootbox'
import TaskConstants from 'constants/task'

import DinamicForm from 'components/dinamic-form'
import Modalizer from 'components/modalizer'

const BaseExec = State.extend({
  props: {
    model: 'state'
  },
  parseArgs (args) {
    args.forEach(function (arg) {
      switch (arg.type) {
        case 'date':
          if (Array.isArray(arg.value) && arg.value.length === 1) {
            arg.value = arg.value[0]
            arg.renderValue = arg.value
          }
          break
        case 'file':
          arg.renderValue = arg.value.name
          arg.value = arg.value.dataUrl
          break
        default:
          arg.renderValue = arg.value
          break
      }
    })

    return args
  },
  getDinamicArguments (next) {
    if (this.model.hasDinamicArguments) {
      const form = new DinamicForm({
        fieldsDefinitions: this.model.task_arguments.models
      })

      const modal = new Modalizer({
        buttons: true,
        confirmButton: 'Run',
        title: `Run ${this.model.name} with dynamic arguments`,
        bodyView: form
      })

      this.listenTo(modal, 'hidden', () => {
        form.remove()
        modal.remove()
      })

      this.listenTo(modal, 'confirm', () => {
        /**
         * @param {Object} args a {key0: value0, key1: value1, ...} object with each task argument
         */
        form.submit((err, args) => {
          const orders = Object.keys(args)
          next(
            orders.map((order) => {
              return {
                order: parseInt(order),
                label: this.model.task_arguments.get(parseInt(order), 'order').label,
                value: args[order],
                type: this.model.task_arguments.get(parseInt(order), 'order').type
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
  checkInProgress () {
    let inProgress = this.model.jobs.models.some(job => {
      return job.inProgress
    })

    if (inProgress) {
      bootbox.confirm({
        message: `Task <b>${this.model.name}</b> is currently under execution, do you wish to execute it again?`,
        backdrop: true,
        callback: (confirmed) => {
          if (confirmed) {
            this._confirmExecution()
          }
        }
      })
    } else {
      this._confirmExecution()
    }
  },
  _confirmExecution () {
    let callback = taskArgs => {
      let message
      if (taskArgs.length > 0) {
        taskArgs = this.parseArgs(taskArgs)

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
            App.actions.job.createFromTask(this.model, taskArgs)
          }
        }
      })
    }

    if (this.model.type === TaskConstants.TYPE_DUMMY) {
      this.getDinamicOutputs(callback)
    } else {
      this.getDinamicArguments(callback)
    }
  }
})

const ExecTask = BaseExec.extend({
  getDinamicOutputs (next) {
    if (this.model.hasDinamicOutputs) {
      const form = new DinamicForm({
        fieldsDefinitions: this.model.output_parameters.models
      })

      const modal = new Modalizer({
        buttons: true,
        confirmButton: 'Run',
        title: `Run ${this.model.name} with dynamic arguments`,
        bodyView: form
      })

      this.listenTo(modal, 'shown', () => { form.focus() })

      this.listenTo(modal, 'hidden', () => {
        form.remove()
        modal.remove()
      })

      this.listenTo(modal, 'confirm', () => {
        /**
         * @param {Object} args a {key0: value0, key1: value1, ...} object with each task argument
         */
        form.submit((err, args) => {
          const orders = Object.keys(args)
          next(
            orders.map((order) => {
              return {
                order: parseInt(order),
                label: this.model.output_parameters.get(parseInt(order), 'order').label,
                value: args[order],
                type: this.model.output_parameters.get(parseInt(order), 'order').type
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
    if (!this.model.canExecute) return

    let reporting = this.model.hostIsReporting()
    if (reporting === null) return  // cannot find the resource for this task
    if (reporting === false) {
      bootbox.confirm({
        message: `
        <h2>At this moment the host that runs this task is not reporting.</h2>
        <h2>Would you like to queue this task for running when the host is restored?</h2>
        `,
        backdrop: true,
        callback: (confirmed) => {
          if (confirmed) this.checkInProgress()
        }
      })
    } else this.checkInProgress()
  }
})

const ExecApprovalTask = BaseExec.extend({
  execute () {
    this.checkInProgress()
  }
})

exports.BaseExec = BaseExec
exports.ExecTask = ExecTask
exports.ExecApprovalTask = ExecApprovalTask
