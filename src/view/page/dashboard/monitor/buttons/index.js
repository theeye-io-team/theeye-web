import App from 'ampersand-app'
import acls from 'lib/acls'
import View from 'ampersand-view'
import JobOutput from './job-output'
import * as MonitorConstants from 'constants/monitor'
import $ from 'jquery'
import * as Buttons from 'view/page/monitor/buttons'

// main buttons view renderer
export default View.extend({
  template: `<div></div>`,
  render () {
    this.renderWithTemplate()
    this.renderButtonsByMonitorType(this.model)
  },
  renderButtonsByMonitorType (model) {
    const container = this.el
    const type = model.type
    let buttons

    switch (type) {
      case MonitorConstants.TYPE_HOST:
        buttons = [ Buttons.Workflow, Buttons.Search, Buttons.Mute, Buttons.BotReconfigure ]
        const submonitors = this.model.submonitors.models
        let showHostStats = submonitors.some((submonitor) => {
          return submonitor.type === 'dstat'
        })
        if (showHostStats) {
          buttons.unshift(Buttons.HostStats)
        }
        break;
      case MonitorConstants.TYPE_NESTED:
        buttons = [ null, Buttons.Workflow, Buttons.Search, Buttons.Mute ]
        break;
      case MonitorConstants.TYPE_SCRAPER:
      case MonitorConstants.TYPE_PROCESS:
      case MonitorConstants.TYPE_SCRIPT:
      case MonitorConstants.TYPE_FILE:
        buttons = [ LastEvent, Buttons.Workflow, Buttons.Search, Buttons.Mute ]
        break;
      default:
        buttons = []
        break;
    }

    if (Array.isArray(buttons)) {
      if (acls.hasAccessLevel('admin')) {
        buttons.splice(1, 0, Buttons.Edit)
        if (type === MonitorConstants.TYPE_FILE) { buttons.splice(2, 0, EditFileButton) }
        if (type === MonitorConstants.TYPE_SCRIPT) { buttons.splice(2, 0, EditScriptButton) }
        buttons.push(Buttons.Remove)
      }
    }

    if (!buttons) return

    buttons.forEach(buttonClass => {
      if (!buttonClass) { return }
      let button = new buttonClass({ model: this.model })
      button.render()

      let li = document.createElement('li')
      li.appendChild(button.el)
      container.appendChild(li)
      this.registerSubview(button)
    })
  }
})

const LastEvent = View.extend({
  template: `
    <button class="btn btn-primary" title="Last Event" data-hook="last_event">
      <i class="fa fa-file-text-o dropdown-icon" aria-hidden="true"></i>
      <span>Last event</span>
    </button>
  `,
  events: {
    'click button[data-hook=last_event]':'onClickLastEvent',
  },
  onClickLastEvent (event) {
    event.preventDefault();
    event.stopPropagation();
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')


    const view = new JobOutput({
      output: this.model.last_event || 'it is empty'
    })
    view.show()

    this.listenTo(this.model, 'change:last_event', () => {
      view.output = this.model.last_event
    })

    return false
  }
})

const EditFileButton = View.extend({
  template: `
    <li>
      <button class="btn btn-primary" title="Edit File">
        <i class="fa fa-code" aria-hidden="true"></i>
        <span>Edit File</span>
      </button>
    </li>
  `,
  events: {
    'click button':'onClickButton',
  },
  onClickButton (event) {
    event.preventDefault()
    event.stopPropagation()
    if (!this.model.monitor.file) { return }
    App.actions.file.edit(this.model.monitor.file)
    return false
  }
})

const EditScriptButton = View.extend({
  template: `
    <li>
      <button class="btn btn-primary" title="Edit Script">
        <i class="fa fa-code" aria-hidden="true"></i>
        <span>Edit Script</span>
      </button>
    </li>
  `,
  events: {
    'click button':'onClickButton',
  },
  onClickButton (event) {
    event.preventDefault()
    event.stopPropagation()
    if (!this.model.monitor.script_id) { return }
    App.actions.file.edit(this.model.monitor.script_id)
    return false
  }
})
