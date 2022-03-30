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
          next(
            orders.map((order) => {
              let data = {
                order: parseInt(order),
                label: this.model.task_arguments.get(parseInt(order), 'order').label,
                value: args[order],
                type: this.model.task_arguments.get(parseInt(order), 'order').type,
                masked: this.model.task_arguments.get(parseInt(order), 'order').masked
              }
              return data
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
  checkRequiredArguments () {
    this.getDynamicArguments(args => this._confirmExecution(args))
  },
  _confirmExecution (taskArgs) {
    let confirmView = new ConfirmExecution({
      message: `run the task ${this.model.name}`,
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
      modal.hide()
      App.actions.job.create(this.model, taskArgs)
    })

    modal.show()
  },
})

export const ExecTask = BaseExec.extend({
  execute () {
    if (this.preconditionsFulfilled() === false) { return }

    if (this.model.hostIsReporting()) {
      this.checkRequiredArguments()
    } else {
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
    }
    bootbox.alert(err.message)
  },
  preconditionsFulfilled () {
    try {
      if (App.state.session.licenseExpired) {
        throw new Error('Your license has expired! </br> Please contact your service provider to activate the product again.')
      }

      const task = this.model
      if (!task.canExecute) {
        const reason = `Task <b>${task.name}</b>: ${task.missingConfiguration}`
        if (task.hasWorkflow) {
          throw new Error(`This workflow cannot be executed. You need to complete it first<br><br>Reason:<br>${reason}`)
        } else {
          throw new Error(`This task cannot be executed. You need to complete it first<br><br>Reason:<br>${reason}`)
        }
      }
      return true
    } catch (err) {
      bootbox.alert(err.message)
      return false
    }
  }
})
