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
exports.FINISHED = 'finished'
exports.TERMINATED = 'terminated'
exports.CANCELED = 'canceled'
exports.EXPIRED = 'expired'
exports.COMPLETED = 'completed'

exports.inProgress = (lifecycle) => {
  if (!lifecycle) return false
  return (
    lifecycle === READY ||
    lifecycle === ASSIGNED ||
    lifecycle === ONHOLD
  )
}
