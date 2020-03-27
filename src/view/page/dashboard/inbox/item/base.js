import View from 'ampersand-view'
import moment from 'moment'

const iconByType = {
  scraper: 'fa-cloud',
  script: 'fa-code',
  host: 'theeye-robot-solid',
  process: 'fa-cog',
  file: 'fa-file-o',
  dstat: 'fa-bar-chart',
  psaux: 'fa-cogs',
  nested: 'fa-bullseye',
  approval: 'fa-thumbs-o-up',
  webhook: 'fa-exchange',
  workflow: 'fa-sitemap',
  notification: 'fa-bell'
}

const resourceType = {
  Resource: 'Monitor',
  ScriptJob: 'ScriptTask',
  Webhook: 'Webhook',
  WorkflowJob: 'Workflow',
  NotificationJob: 'NotificationJob'
}

export default View.extend({
  props: {
    colorClass: 'string',
    modelType: 'string',
    modelSubType: 'string',
    modelName: 'string',
    message: 'string',
    time: 'string',
    icon: 'string',
    text: 'string',
    hostName: 'string'
  },
  template: require('./inboxRow.hbs'),
  bindings: {
    message: { hook: 'message' },
    time: { hook: 'time' },
    modelType: { hook: 'modelType' },
    modelSubType: { hook: 'modelSubType' },
    modelName: { hook: 'modelName' },
    colorClass: { type: 'class' },
    icon: {
      type: 'attribute',
      name: 'class',
      hook: 'icon'
    },
    hostName: { hook: 'hostName' }
  },
  derived: {
    collapsedHeaderId: {
      deps: ['model.id'],
      fn () {
        return `collapse_heading_${this.model.id}`
      }
    },
    collapseContainerId: {
      deps: ['model.id'],
      fn () {
        return `collapse_container_${this.model.id}`
      }
    },
  },
  initialize () {
    this.inboxify()
  },
  inboxify () {
    let format = 'L [at] LT'
    if (new Date().toDateString() === new Date(this.model.createdAt).toDateString()) {
      format = '[Today at] LT'
    }

    const type = this.model.data.model._type

    this.time = moment(this.model.createdAt).format(format)

    this.modelName = this.model.data.model.name
    this.modelType = resourceType[this.model.data.model_type]
    this.modelSubType = ''
    this.icon = ''

    this.customizeItem()
  },
  sanitizeState (state) {
    if (!state) { return '' }
    return state.toLowerCase().replace(/ /g, '_')
  },
  render () {
    this.renderWithTemplate(this)
    this.setModelIcon(this.modelType, this.modelSubType)
  },
  setModelIcon (modelType, modelSubType) {
    var iconClass = 'circle fa '
    if (modelType === 'NotificationJob') {
      iconClass += ` ${iconByType['notification']} notification-color`
    } else if (modelType === 'Webhook') {
      iconClass += ` ${iconByType['webhook']} webhook-color`
    } else if (modelType === 'Workflow') {
      iconClass += ` ${iconByType['workflow']} workflow-color`
    } else if (modelSubType) {
      iconClass += ` ${iconByType[modelSubType]} ${modelSubType}-color`
    } else {
      iconClass += ` ${iconByType['host']} host-color`
    }

    const iconEl = this.queryByHook('model-icon')
    iconEl.className = iconClass
  }
})
