import XHR from 'lib/xhr'
import config from 'config'
import bootbox from 'bootbox'
import App from 'ampersand-app'

// create
export const createSchedule = (taskId, data, callback = () => {}) => {
  const task = App.state.tasks.get(taskId)
  XHR.send({
    url: `${config.api_url}/task/schedule`,
    method: 'POST',
    jsonData: data,
    headers: {
      Accept: 'application/json;charset=UTF-8'
    },
    done: (response, xhr) => {
      task.schedules.add(response)
      bootbox.alert('Schedule created')
      callback()
    },
    error: (response, xhr) => {
      bootbox.alert('Something goes wrong')
      console.warn(response)
    }
  })
}

// fetch
export const getSchedules = taskId => {
  const task = App.state.tasks.get(taskId)
  XHR.send({
    url: `${config.api_url}/task/${task.id}/schedule`,
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
}

// cancel
export const cancelSchedule = (taskId, scheduleId) => {
  const task = App.state.tasks.get(taskId)
  const schedule = task.schedules.get(scheduleId)

  XHR.send({
    url: `${config.api_url}/task/${task.id}/schedule/${schedule._id}`,
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
}

export const fetch = getSchedules
export const remove = cancelSchedule
export const create = createSchedule
