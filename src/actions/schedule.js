import XHR from 'lib/xhr'
import bootbox from 'bootbox'
import App from 'ampersand-app'

export default {
  create (taskId, data) {
    const task = App.state.tasks.get(taskId)
    XHR.send({
      url: `${task.url()}/schedule`,
      method: 'POST',
      jsonData: data,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response, xhr) => {
        task.schedules.add(response)
        bootbox.alert('Schedule created')
      },
      error: (response, xhr) => {
        bootbox.alert('Something goes wrong')
        console.warn(response)
      }
    })
  },
  fetch (taskId) {
    const task = App.state.tasks.get(taskId)
    XHR.send({
      url: `${task.url()}/schedule`,
      method: 'GET',
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response, xhr) => {
        task.schedules.reset(response || [])
      },
      error: (response, xhr) => {
        console.warn(response)
      }
    })
  },
  cancel (taskId, scheduleId) {
    const task = App.state.tasks.get(taskId)
    const schedule = task.schedules.get(scheduleId)

    XHR.send({
      url: `${task.url()}/schedule/${schedule._id}`,
      method: 'DELETE',
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response, xhr) => {
        task.schedules.remove(schedule)
      },
      error: (response, xhr) => {
        bootbox.alert('There was an error canceling the schedule')
        console.warn(response)
      }
    })
  },
  applyStateUpdate (schedule) {
    let taskId = schedule.data.task_id
    const task = App.state.tasks.get(taskId)
    task.schedules.add(schedule)
  }
}
