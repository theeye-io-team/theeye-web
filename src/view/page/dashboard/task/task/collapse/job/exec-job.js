import App from 'ampersand-app'
import bootbox from 'bootbox'
import DinamicForm from 'components/dinamic-form'
import Modalizer from 'components/modalizer'
import {BaseExec} from '../../exec-task.js'
import FIELD from 'constants/field'
import moment from 'moment'

const buildMessage = function (model) {
  let params = model.task.task_arguments
  let values = model.task_arguments_values
  let message = `<p>Task <b>${model.name}</b> needs your approval to continue.</p>`

  if (params.length) {
    message += '<br><p><b>Please verify this information: </b></p><br>'
  }

  params.forEach(function (param, index) {
    let line = `<p>${param.label}: `
    switch (param.type) {
      case FIELD.TYPE_FIXED:
      case FIELD.TYPE_INPUT:
        line += values[index]
        break
      case FIELD.TYPE_DATE:
        line += moment(values[index]).format('D-MMM-YY, HH:mm:ss')
        break
      case FIELD.TYPE_FILE:
        line += `<a href='${values[index]}' download='file${index + 1}'>Download</a>`
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

const ExecApprovalJob = BaseExec.extend({
  getDinamicOutputs (next) {
    if (this.model.hasDinamicOutputs) {
      const form = new DinamicForm({
        fieldsDefinitions: this.model.task.output_parameters
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
                label: this.model.taskModel.output_parameters.get(parseInt(order), 'order').label,
                value: args[order],
                type: this.model.taskModel.output_parameters.get(parseInt(order), 'order').type
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
  execute (isPendingCheck, done) {
    if (this.model.inProgress) {
      if (this.model.isApprover(App.state.session.user.id)) {
        this.requestApproval(isPendingCheck, done)
      } else {
        if (!isPendingCheck) {
          this.updateApprovalRequest(done)
        }
      }
    }
  },
  requestApproval (isPendingCheck, done) {
    let message = buildMessage(this.model)

    var buttons = {
      reject: {
        label: 'Reject',
        className: 'btn btn-danger',
        callback: () => {
          this.getDinamicOutputs(jobArgs => {
            jobArgs = this.parseArgs(jobArgs)
            App.actions.job.reject(this.model, jobArgs)
            if (done) done()
          })
        }
      },
      approve: {
        label: 'Approve',
        className: 'btn btn-primary',
        callback: () => {
          this.getDinamicOutputs(jobArgs => {
            jobArgs = this.parseArgs(jobArgs)
            App.actions.job.approve(this.model, jobArgs)
            if (done) done()
          })
        }
      }
    }

    if (isPendingCheck) {
      buttons.skip = {
        label: 'Skip',
        className: 'btn btn-default',
        callback: () => {
          if (done) done()
        }
      }
    }

    bootbox.dialog({
      message: message,
      backdrop: true,
      buttons: buttons
    })
  },
  updateApprovalRequest (done) {
    const message = `The Approval request is pending. Cancel approval request?`

    bootbox.dialog({
      message: message,
      backdrop: true,
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

exports.ExecJob = ExecJob
exports.ExecApprovalJob = ExecApprovalJob
