
const FAILURE = 'failure'
const SUCCESS = 'success'
const NORMAL = 'normal'
const RECOVERED = 'recovered'
const MONITOR_STOPPED = 'updates_stopped'
const MONITOR_STARTED = 'updates_started'
const CHANGED = 'changed'
const ERROR = 'error'
const CANCELED = 'canceled'
const INTEGRATION_STARTED = 'started'
const INTEGRATION_STOPPED = 'stopped'
const UNKNOWN = 'unknown'

exports.INTEGRATION_STARTED = INTEGRATION_STARTED
exports.INTEGRATION_STOPPED = INTEGRATION_STOPPED
exports.FAILURE = FAILURE
exports.SUCCESS = SUCCESS
exports.NORMAL = NORMAL
exports.CANCELED = CANCELED
exports.RECOVERED = RECOVERED
// already in used, cannot be renamed easily
exports.STOPPED = MONITOR_STOPPED
exports.STARTED = MONITOR_STARTED
exports.CHANGED = CHANGED
exports.ERROR = ERROR
exports.UNKNOWN = UNKNOWN

exports.STATES = [
  INTEGRATION_STARTED,
  INTEGRATION_STOPPED,
  FAILURE,
  SUCCESS,
  NORMAL,
  CANCELED,
  RECOVERED,
  MONITOR_STOPPED,
  MONITOR_STARTED,
  CHANGED,
  ERROR,
  UNKNOWN
]
