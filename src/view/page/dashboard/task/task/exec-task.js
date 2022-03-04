import App from 'ampersand-app'
import State from 'ampersand-state'
import bootbox from 'bootbox'
import * as JobConstants from 'constants/job'
import DynamicForm from 'view/dynamic-form'
import Modalizer from 'components/modalizer'
import ConfirmExecution from './confirm-execution'

export const BaseExec = State.extend({
  props: {
    model: 'state'
  },
  getDynamicArguments (next) {
    if (this.model.hasDynamicArguments) {
      const form = new DynamicForm({
        fieldsDefinitions: this.model.task_arguments.models
      })

      const modal = new Modalizer({
        buttons: true,
        confirmButton: 'Continue',
        title: `Run task: ${this.model.name}`,
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
          let taskArgs = orders.map((order) => {
            let data = {
              order: parseInt(order),
              label: this.model.task_arguments.get(parseInt(order), 'order').label,
              value: args[order],
              type: this.model.task_arguments.get(parseInt(order), 'order').type,
              masked: this.model.task_arguments.get(parseInt(order), 'order').masked
            }
            return data
          })
          let totalFileSize = 0
          taskArgs.forEach(arg => {
            if (arg.type === 'file') {
              totalFileSize += arg.value?.size
            }
          })
          if (totalFileSize < 1048576) {
            next(taskArgs)
            modal.hide()
          } else {
            bootbox.alert('The total file size exceeds the maximum 10Mb value')
          }
        })
      })
      modal.show()
    } else {
      next([])
    }
  },
  //checkInProgress () {
  //  let inProgress = this.model.jobs.models.some(job => {
  //    return job.inProgress
  //  })

  //  if (inProgress && this.model.multitasking === true) {
  //    bootbox.confirm({
  //      message: `Task <b>${this.model.name}</b> is currently under execution, do you wish to execute it again?`,
  //      backdrop: true,
  //      callback: (confirmed) => {
  //        if (confirmed) {
  //          this.checkRequiredArguments()
  //        }
  //      }
  //    })
  //  } else {
  //    this.checkRequiredArguments()
  //  }
  //},
  checkRequiredArguments () {
    this.getDynamicArguments(args => this._confirmExecution(args))
  },
  _confirmExecution (taskArgs) {
    let confirmView = new ConfirmExecution({
      name: this.model.name,
      taskArgs
    })

    const modal = new Modalizer({
      buttons: true,
      confirmButton: 'Confirm',
      title: `Run task: ${this.model.name}`,
      bodyView: confirmView
    })

    this.listenTo(modal, 'hidden', () => {
      confirmView.remove()
      modal.remove()
    })

    this.listenTo(modal, 'confirm', () => {
      if (App.state.progress.status !== 'working') {
        App.actions.job.create(this.model, taskArgs)
      }
      this.listenTo(App.state.progress, 'change:status', () => {
        if (App.state.progress.status === 'success') {
          modal.hide()
          App.state.progress.reset()
        }
        else if (App.state.progress.status === 'failure') {
          bootbox.alert('Failed to upload job, please try again. If the problem persists, reload the window')
        }
      })
    })

    modal.show()
  },
  _restartExecution (taskArgs) {
    let confirmView = new ConfirmExecution({
      name: this.model.name,
      taskArgs
    })

    const modal = new Modalizer({
      buttons: true,
      confirmButton: 'Restart',
      title: `Restart ${this.model.name}`,
      bodyView: confirmView
    })

    this.listenTo(modal, 'hidden', () => {
      confirmView.remove()
      modal.remove()
    })

    this.listenTo(modal, 'confirm', () => {
      modal.hide()
      App.actions.job.restart(this.model, taskArgs)
    })

    modal.show()
    
    //App.actions.job.restart(this.model, taskArgs)
  },
})

export const ExecTask = BaseExec.extend({
  execute () {
    let reporting = this.model.hostIsReporting()
    if (reporting === null) {
      return  // cannot find the resource for this task
    }

    if (reporting === false) {
      bootbox.confirm({
        message: `
        <h2>At this moment the host that runs this task is not reporting.</h2>
        <h2>Would you like to queue this task for running when the host is restored?</h2>
        `,
        backdrop: true,
        callback: (confirmed) => {
          if (confirmed) {
            this.checkRequiredArguments()
          }
        }
      })
    } else {
      this.checkRequiredArguments()
    }
  }
})

export const ExecTaskWithNoHost = BaseExec.extend({
  execute () {
    this.checkRequiredArguments()
  }
})

//export { BaseExec, ExecTask, ExecTaskWithNoHost }
