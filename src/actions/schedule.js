import XHR from 'lib/xhr'
import App from 'ampersand-app'
import * as OperationsConstants from 'constants/operations'

export default {
  create (model, data) {
    // (model.type) ... task / workflow
    XHR.send({
      url: `${model.url()}/schedule`,
      method: 'POST',
      jsonData: {
        runDate: data.datetime,
        repeatEvery: data.frequency
      },
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response, xhr) => {
        model.schedules.add(response)
        App.state.alerts.success('Great!', 'Schedule created')
      },
      error: (response, xhr) => {
        App.state.alerts.danger('Oops!..', 'Schedule cannot be created')
        console.warn(response)
      }
    })
  },
  fetch (model) {
    //const task = App.state.tasks.get(taskId)
    XHR.send({
      url: `${model.url()}/schedule`,
      method: 'GET',
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response, xhr) => {
        model.schedules.reset(response || [])
      },
      error: (response, xhr) => {
        console.warn(response)
      }
    })
  },
  /**
   * @param {Task|Workflow} scheduledModel
   * @param {Schedule} schedule
   */
  cancel (scheduledModel, schedule) {
    schedule.destroy({
      success () {
        scheduledModel.schedules.remove(schedule)
      },
      error (err) {
        App.state.alerts.danger('Oops!..', 'There was an error canceling the schedule')
        console.warn(err)
      }
    })
  },
  disabledToggle (schedule) {
    const action = (schedule.disabled === true) ? 'start' : 'stop'
    XHR.send({
      url: `${schedule.url()}/${action}`,
      method: 'put',
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (resp) {
        schedule.toggle('disabled') 
      }
    })
  },
  applyStateUpdate (schedule, operation) {
    if (schedule.data.task_id) {
      const taskId = schedule.data.task_id
      const task = App.state.tasks.get(taskId)

      if (
        operation === OperationsConstants.UPDATE ||
        operation === OperationsConstants.CREATE ||
        operation === OperationsConstants.REPLACE
      ) {
        task.schedules.add(schedule)
      } else {
        if (operation === OperationsConstants.DELETE) {
          task.schedules.remove(schedule)
        }
      }
    }
  }
}
