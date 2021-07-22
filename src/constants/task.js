
export const TYPE_SCRAPER = 'scraper'
export const TYPE_SCRIPT = 'script'
export const TYPE_APPROVAL = 'approval'
export const TYPE_DUMMY = 'dummy'
export const TYPE_NOTIFICATION = 'notification'
export const TYPE_GROUP = 'group'

export const APPROVALS_TARGET_FIXED = 'fixed'
export const APPROVALS_TARGET_ASSIGNEES = 'assignees'
export const APPROVALS_TARGET_DYNAMIC = 'dynamic'
export const APPROVALS_TARGET_INITIATOR = 'initiator'

export const ARGUMENT_TYPE_LEGACY = 'legacy'
export const ARGUMENT_TYPE_JSON = 'json'
export const ARGUMENT_TYPE_TEXT = 'text'


export const GRACE_TIME = Object.freeze([
  {
    secs: 0,
    mins: 0,
    text: 'No Wait / No cancelation'
  },
  {
    secs: 60,
    mins: 1,
    text: '1 Minutes'
  },
  {
    secs: 300,
    mins: 5,
    text: '5 Minutes'
  },
  {
    secs: 600,
    mins: 10,
    text: '10 Minutes'
  },
  {
    secs: 900,
    mins: 15,
    text: '15 Minutes'
  },
])
