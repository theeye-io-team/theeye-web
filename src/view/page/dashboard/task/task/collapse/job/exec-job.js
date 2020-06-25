import App from 'ampersand-app'
import bootbox from 'bootbox'
import DynamicForm from 'view/dynamic-form'
import Modalizer from 'components/modalizer'
import { BaseExec } from '../../exec-task.js'
import * as FIELD from 'constants/field'
import moment from 'moment'
import isURL from 'validator/lib/isURL'
import * as JobConstants from 'constants/job'

const ExecJob = BaseExec.extend({
  execute () {
    if (this.model.inProgress) {
      const message = `Cancel <b>${this.model.name}</b> the execution of this task?
        <a target="_blank" href="https://github.com/theeye-io/theeye-docs/blob/master/tasks/cancellation">Why this happens?</a>`

      bootbox.confirm({
        message: message,
        backdrop: true,
        callback: (confirmed) => {
          if (confirmed) {
            App.actions.job.cancel(this.model)
          }
        }
      })
    }
  }
})

const ExecOnHoldJob = BaseExec.extend({
  execute (isPendingCheck, done) {
    if (this.model.inProgress) {
      if (this.model._type === JobConstants.APPROVAL_TYPE) {
        if (this.model.isApprover(App.state.session.user)) {
          this.requestApproval(isPendingCheck, done)
        } else {
          if (!isPendingCheck) {
            this.updateApprovalRequest(done)
          }
        }
      } else {
        this.requestInput(isPendingCheck, done)
      }
    }
  },
  getDynamicArguments (next) {
    const task = new App.Models.Task.Factory(this.model.task)
    const form = new DynamicForm({ fieldsDefinitions: task.task_arguments.models })
    const modal = new Modalizer({
      buttons: true,
      confirmButton: 'Run',
      title: `Run task: ${task.name}`,
      bodyView: form
    })


    this.listenTo(modal, 'hidden', () => {
      form.remove()
      modal.remove()
    })

    this.listenTo(modal, 'cancel', () => {
      modal.hide()
      next(null, true)
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
        next(this.parseArgs(taskArgs))
      })
    })

    modal.show()
    return modal
  },
  requestInput (isPendingCheck, done) {
    done || (done=()=>{})
    this.getDynamicArguments((jobArgs, canceled) => {
      if (canceled) {
        if (isPendingCheck) {
          App.actions.onHold.skip(this.model)
          return done()
        } else {
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
                return done()
              }
            }
          })
        }
      } else {
        App.actions.job.submitInputs(this.model, jobArgs)
        return done()
      }
    })
  },
  requestApproval (isPendingCheck, done) {
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

    var buttons = {
      reject: {
        label: 'Reject',
        className: 'btn btn-danger',
        callback: () => {
          App.actions.job.reject(this.model, jobArgs)
          if (done) done()
        }
      },
      approve: {
        label: 'Approve',
        className: 'btn btn-primary',
        callback: () => {
          App.actions.job.approve(this.model, jobArgs)
          if (done) done()
        }
      }
    }

    if (isPendingCheck) {
      buttons.skip = {
        label: 'Skip',
        className: 'btn btn-default',
        callback: () => {
          App.actions.onHold.skip(this.model)
          if (done) done()
        }
      }
    }

    bootbox.dialog({
      message: message,
      backdrop: true,
      closeButton: (App.state.session.user.credential==='root'),
      buttons: buttons
    })
  },
  updateApprovalRequest (done) {
    const message = `The Approval request is pending. Cancel approval request?`

    bootbox.dialog({
      message: message,
      backdrop: true,
      //closeButton: (App.state.session.user.credential==='root'),
      buttons: {
        cancel: {
          label: 'Cancel request',
          className: 'btn btn-danger',
          callback: () => {
            App.actions.job.cancel(this.model)
            if (done) done()
          }
        }
      }
    })
  }
})

const buildApprovalMessage = (model) => {
  let params = model.task.task_arguments
  let values = model.task_arguments_values
  let message = `<p>Task <b>${model.name}</b> needs your approval to continue.</p>`

  if (params.length) {
    message += '<br><p><b>Please verify this information: </b></p><br>'
  }

  params.forEach(function (param, index) {
    let line = `<p>${param.label}: `
    let value = values[index]
    switch (param.type) {
      case FIELD.TYPE_FIXED:
      case FIELD.TYPE_INPUT:
        if (value && isURL(value)) {
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

export { ExecJob, ExecOnHoldJob }
