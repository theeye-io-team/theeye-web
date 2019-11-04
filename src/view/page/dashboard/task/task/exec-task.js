import App from 'ampersand-app'
import State from 'ampersand-state'
import bootbox from 'bootbox'
import JobConstants from 'constants/job'
import DynamicForm from 'view/dynamic-form'
import Modalizer from 'components/modalizer'
import ConfirmExecution from './confirm-execution'

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
            arg.renderValue = arg.value.toString()
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
  getDynamicArguments (next) {
    if (this.model.hasDynamicArguments) {
      const form = new DynamicForm({
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

      this.listenTo(modal, 'customevent', () => {
        console.log('customevent')
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
                type: this.model.task_arguments.get(parseInt(order), 'order').type,
                masked: this.model.task_arguments.get(parseInt(order), 'order').masked
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
      if (taskArgs.length > 0) {
        taskArgs = this.parseArgs(taskArgs)
      }

      let confirmView = new ConfirmExecution({
        name: this.model.name,
        taskArgs: taskArgs
      })

      const modal = new Modalizer({
        buttons: true,
        confirmButton: 'Run',
        title: `Run ${this.model.name} with dynamic arguments`,
        bodyView: confirmView
      })

      this.listenTo(modal, 'hidden', () => {
        confirmView.remove()
        modal.remove()
      })

      this.listenTo(modal, 'confirm', () => {
        modal.hide()
        App.actions.job.createFromTask(this.model, taskArgs)
      })

      modal.show()
    }

    this.getDynamicArguments(callback)
  }
})

const ExecTask = BaseExec.extend({
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

const ExecTaskWithNoHost = BaseExec.extend({
  execute () {
    this.checkInProgress()
  }
})

exports.BaseExec = BaseExec
exports.ExecTask = ExecTask
exports.ExecTaskWithNoHost = ExecTaskWithNoHost
