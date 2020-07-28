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
  template () {
    return rowTemplate(this)
  },
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
    collapseHeaderId: {
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
    if (new Date().toDateString() === new Date(this.model.creation_date).toDateString()) {
      format = '[Today at] LT'
    }

    this.time = moment(this.model.creation_date).format(format)
    this.modelName = this.model.data.model.name
    this.modelType = resourceType[this.model.target_model_type]
    this.modelSubType = ''
    this.icon = ''

    this.customizeItem()
  },
  render () {
    this.renderWithTemplate(this)
    this.setModelIcon()
  },
  setModelIcon () {
    const { modelType, modelSubType } = this

    let iconClass = 'circle fa'
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

const rowTemplate = (state) => {
  const { collapseHeaderId, collapseContainerId } = state
  let html = `
    <div class="inbox-entry panel panel-default">
      <div class="panel-heading" role="tab" id="${ collapseHeaderId }">
        <h4 class="panel-title-icon"><i data-hook="model-icon"></i></h4>
        <h4 class="panel-title inbox-title">
          <span class="collapsed"
            href="#${ collapseContainerId }"
            data-hook="collapse-toggle"
            data-toggle="collapse"
            data-parent="#notifications-accordion"
            aria-expanded="false"
            aria-controls="${ collapseContainerId }">
            <div class="panel-title-content">
              <div class="panel-item name entry-text">
                <span class="capitalize" data-hook="modelType"></span>
                <span data-hook="modelName"></span>
                <span data-hook="message"></span>

              </div>
              <div class="panel-item state-icon">
                <span data-hook="icon"></span>
              </div>
            </div>
          </span>
        </h4>
      </div>
      <div class="panel-collapse collapse"
        data-hook="collapse-container"
        id="${ collapseContainerId }"
        role="tabpanel"
        aria-labelledby="${ collapseHeaderId }">
        <div class="panel-body" data-hook="collapse-container-body">
          <div>
            <span>Event: </span>
            <span class="capitalize" data-hook="modelType"></span>
            <span data-hook="modelName"></span>
            <span data-hook="message"></span>
          </div>
          <div>
            <span>Time: </span>
            <span data-hook="time"></span>
          </div>
          <div>
            <span>Bot: </span>
            <span class="capitalize" data-hook="hostName"></span>
          </div>
        </div>
      </div>
    </div>
      `
  return html
}
