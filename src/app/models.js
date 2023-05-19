import App from 'ampersand-app'

import * as Customer from 'models/customer'
import * as Event from 'models/event'
import * as File from 'models/file'
import * as Host from 'models/host'
import * as HostGroup from 'models/hostgroup'
import * as Indicator from 'models/indicator'
import * as Job from 'models/job'
import * as Member from 'models/member'
import * as Monitor from 'models/monitor'
import * as Resource from 'models/resource'
import * as Script from 'models/file/script'
import * as Tag from 'models/tag'
import * as Task from 'models/task'
import * as Token from 'models/token'
import * as User from 'models/user'
import * as Webhook from 'models/webhook'
import * as Workflow from 'models/workflow'
import * as Group from 'models/group'
import * as IAM from 'models/iam'

App.extend({
  Models: {
    Customer,
    Event,
    File,
    Group,
    Host,
    HostGroup,
    Indicator,
    Job,
    Member,
    Monitor,
    IAM,
    Resource,
    Script,
    Tag,
    Task,
    Token,
    User,
    Webhook,
    Workflow,
  }
})
