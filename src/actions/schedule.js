import XHR from 'lib/xhr'
import config from 'config'
import bootbox from 'bootbox'

export const create = (task, data, callback = () => {}) => {
  XHR.send({
    url: `${config.api_url}/task/schedule`,
    method: 'POST',
    jsonData: data,
    timeout: 5000,
    withCredentials: true,
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

export const getSchedules = task => {
  XHR.send({
    url: `${config.api_url}/task/${task.id}/schedule`,
    method: 'GET',
    timeout: 5000,
    withCredentials: true,
    headers: {
      Accept: 'application/json;charset=UTF-8'
    },
    done: (response, xhr) => {
      const scheduleData = response.scheduleData
      if (!scheduleData) return
      task.schedules.reset(response.scheduleData)
    },
    error: (response, xhr) => {
      console.warn(response)
    }
  })
}

export const cancelSchedule = (task, schedule) => {
  XHR.send({
    url: `${config.api_url}/task/${task.id}/schedule/${schedule._id}`,
    method: 'DELETE',
    timeout: 5000,
    withCredentials: true,
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
