/**
 *
 * do you have a better idea ?
 *
 * https://en.wikipedia.org/wiki/Task_management
 *
 **/
const READY = exports.READY = 'ready'
const ASSIGNED = exports.ASSIGNED = 'assigned'
const ONHOLD = exports.ONHOLD = 'onhold'
const FINISHED = exports.FINISHED = 'finished'
const TERMINATED = exports.TERMINATED = 'terminated'
const CANCELED = exports.CANCELED = 'canceled'
const EXPIRED = exports.EXPIRED = 'expired'
const COMPLETED = exports.COMPLETED = 'completed'

exports.inProgress = (lifecycle) => {
  if (!lifecycle) return false
  return (
    lifecycle === READY ||
    lifecycle === ASSIGNED ||
    lifecycle === ONHOLD
  )
}

exports.isValidNewLifecycle = (currentVal, newVal) => {
  let valid
  switch (currentVal) {
    case READY:
      valid = true
      break
    case ASSIGNED:
      valid = (newVal !== READY)
      break
    case ONHOLD:
      valid = (newVal !== READY && newVal !== ASSIGNED)
      break
    case FINISHED:
    case TERMINATED:
    case CANCELED:
    case EXPIRED:
    case COMPLETED:
      valid = false
      break
    default:
      valid = false
  }
  return valid
}
