import BaseItem from './base'

export default BaseItem.extend({
  props: {
    body: 'string'
  },
  bindings: Object.assign({}, BaseItem.prototype.bindings, {
    body: { hook: 'body' }
  }),
  template () {
    return rowTemplate(this)
  },
  customizeItem () {
    let notification = this.model
    this.colorClass = notification.data.model._type
    this.icon = notification.event_icon
    this.message = notification.message
    this.modelName = notification.data.model.name
    this.body = notification.data.notification.body
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
                <span class="capitalize" data-hook="message"></span>
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
            <span class="capitalize" data-hook="body"></span>
          </div>
          <div>
            <span>Task: </span>
            <span data-hook="modelName"></span>
          </div>
          <div>
            <span>Time: </span>
            <span data-hook="time"></span>
          </div>
        </div>
      </div>
    </div>
  `
  return html
}
