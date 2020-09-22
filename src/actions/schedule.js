import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import App from 'ampersand-app'

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
        bootbox.alert('Schedule created')
      },
      error: (response, xhr) => {
        bootbox.alert('Something goes wrong')
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
        bootbox.alert('There was an error canceling the schedule')
        console.warn(err)
      }
    })
  },
  applyStateUpdate (schedule) {
    let taskId = schedule.data.task_id
    const task = App.state.tasks.get(taskId)
    task.schedules.add(schedule)
  }
}
