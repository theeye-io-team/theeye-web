import View from 'ampersand-view'
import moment from 'moment'

const resourceType = {
  Resource: 'Resource',
  ScriptJob: 'Task'
}

export default View.extend({
  props: {
    colorClass: 'string',
    modelType: 'string',
    modelName: 'string',
    message: 'string',
    time: 'string',
    icon: 'string',
    text: 'string'
  },
  template: `
  <div class="inbox-entry">
  <span data-hook="icon"></span>
  <span data-hook="time"></span>
  <span data-hook="modelType"></span>
  <span data-hook="modelName" class="label label-primary"></span>
  <span data-hook="message"></span>
  </div>
  `,
  bindings: {
    message: { hook: 'message' },
    time: { hook: 'time' },
    modelName: { hook: 'modelName' },
    modelType: { hook: 'modelType' },
    colorClass: { type: 'class' },
    icon: {
      type: 'attribute',
      name: 'class',
      hook: 'icon'
    }
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
    this.icon = ''

    this.customizeItem()
  },
  sanitizeState (state) {
    state.toLowerCase().replace(/ /g,"_")
  }
})
