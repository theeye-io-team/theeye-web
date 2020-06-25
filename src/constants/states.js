
export const FAILURE = 'failure'
export const SUCCESS = 'success'
export const NORMAL = 'normal'
export const RECOVERED = 'recovered'
export const MONITOR_STOPPED = 'updates_stopped'
export const MONITOR_STARTED = 'updates_started'
export const CHANGED = 'changed'
export const ERROR = 'error'
export const CANCELED = 'canceled'
export const INTEGRATION_STARTED = 'started'
export const INTEGRATION_STOPPED = 'stopped'
export const UNKNOWN = 'unknown'
export const IN_PROGRESS = 'in_progress'
export const TIMEOUT = 'timeout'
// already in used, cannot be renamed easily
export const STOPPED = MONITOR_STOPPED
export const STARTED = MONITOR_STARTED

export const STATES = [
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
  UNKNOWN,
  IN_PROGRESS, TIMEOUT
]
