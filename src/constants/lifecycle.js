/**
 *
 * do you have a better idea ?
 *
 * https://en.wikipedia.org/wiki/Task_management
 *
 **/
export const READY = 'ready'
export const ASSIGNED = 'assigned'
export const ONHOLD = 'onhold'
export const FINISHED = 'finished'
export const TERMINATED = 'terminated'
export const CANCELED = 'canceled'
export const EXPIRED = 'expired'
export const COMPLETED = 'completed'

export const inProgress = (lifecycle) => {
  if (!lifecycle) return false
  return (
    lifecycle === READY ||
    lifecycle === ASSIGNED ||
    lifecycle === ONHOLD
  )
}

export const isCompleted = (lifecycle) => {
  const completed = [
    CANCELED,
    COMPLETED,
    FINISHED,
    EXPIRED, // it takes to much to complete
    TERMINATED // abruptly
  ].indexOf(lifecycle) !== -1

  return completed
}

export const isValidNewLifecycle = (currentVal, newVal) => {
  let valid
  switch (currentVal) {
    case READY:
      valid = true
      break
    case ASSIGNED:
      valid = newVal !== READY
      break
    case ONHOLD:
      valid = newVal !== ASSIGNED
      break
    case FINISHED:
    case TERMINATED:
    case CANCELED:
    case EXPIRED:
    case COMPLETED:
      // restart
      valid = (newVal === READY)
      break
    default:
      valid = false
  }
  return valid
}
