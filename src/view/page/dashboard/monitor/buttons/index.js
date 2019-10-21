import App from 'ampersand-app'
import acls from 'lib/acls'
import View from 'ampersand-view'
import JobOutput from './job-output'
import SearchActions from 'actions/searchbox'
import ResourceActions from 'actions/resource'
import MonitorConstants from 'constants/monitor'
import MonitorEditView from 'view/page/monitor/edit'
import HelpMessages from 'language/help'
import $ from 'jquery'

const Mute = View.extend({
  template: `
    <button class="btn btn-primary" data-hook="mute-toggler">
      <i class="fa dropdown-icon" aria-hidden="true"></i>
      <span data-hook="title_text"></span>
    </button>
  `,
  derived: {
    is_muted: {
      deps: ['model.alerts'],
      fn () {
        return this.model.alerts === false
      }
    },
    title_text: {
      deps: ['is_muted'],
      fn () {
        if (this.is_muted) {
          return HelpMessages.monitor.unmute_button
        } else {
          return HelpMessages.monitor.mute_button
        }
      }
    }
  },
  bindings: {
    is_muted: [{
      selector: 'button i',
      type: 'booleanClass',
      no: 'fa-volume-up',
      yes: 'fa-volume-off',
    },{
      selector: 'button i',
      type: 'booleanClass',
      yes: 'remark-alert'
    }],
    title_text: {
      hook: 'title_text'
    }
  },
  events: {
    'click button[data-hook=mute-toggler]':'onClickButton'
  },
  onClickButton: function(event){
    event.stopPropagation();
    event.preventDefault();
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    if (this.is_muted) {
      ResourceActions.unmute(this.model.id)
    } else {
      ResourceActions.mute(this.model.id)
    }

    return false;
  }
})

const Edit = View.extend({
  template: `
    <button class="btn btn-primary" title="Edit Monitors" data-hook="edit">
      <i class="fa fa-edit dropdown-icon" aria-hidden="true"></i>
      <span>Edit monitor</span>
    </button>
  `,
  events: {
    'click button[data-hook=edit]':'onClickEdit'
  },
  onClickEdit: function(event){
    event.stopPropagation();
    event.preventDefault();
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    if (this.model.type===MonitorConstants.TYPE_NESTED) {
      let view = new MonitorEditView(this.model)
    } else {
      ResourceActions.edit(this.model.id)
    }
    return false;
  }
})

const Workflow = View.extend({
  template: `
    <button class="btn btn-primary" title="Workflow" data-hook="workflow">
      <i class="fa fa-sitemap dropdown-icon" aria-hidden="true"></i>
      <span>Show workflow</span>
    </button>
  `,
  events: {
    'click button[data-hook=workflow]':'onClickWorkflow',
  },
  onClickWorkflow: function(event){
    event.stopPropagation();
    event.preventDefault();
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    ResourceActions.workflow(this.model.monitor.id)
    return false;
  },
})

const Search = View.extend({
  template: `
    <button class="btn btn-primary" title="Search related elements" data-hook="search">
      <i class="fa fa-search dropdown-icon" aria-hidden="true"></i>
      <span>Search related</span>
    </button>
  `,
  events: {
    'click button[data-hook=search]':'onClickSearch',
  },
  onClickSearch: function(event){
    event.stopPropagation();
    event.preventDefault();
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    SearchActions.search(this.model.name)
    return false;
  },
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

    return false;
  }
})

const HostStats = View.extend({
  template: `
    <button class="btn btn-primary" title="Host Stats" data-hook="stats">
      <i class="fa fa-bar-chart dropdown-icon" aria-hidden="true"></i>
      <span>Bot Stats</span>
    </button>
  `,
  events: {
    'click button[data-hook=stats]':'onClickStats',
  },
  onClickStats (event) {
    event.stopPropagation();
    event.preventDefault();
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    // esto no es un action, deberia ser un navigate nomas
    // HostActions.stats(this.model.host_id)
    App.navigate('/admin/hoststats/' + this.model.host_id)
    return false;
  },
})

// main buttons view renderer
module.exports = View.extend({
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
        buttons = [ Workflow, Search, Mute ]
        const submonitors = this.model.submonitors.models
        let showHostStats = submonitors.some((submonitor) => {
          return submonitor.type === 'dstat'
        })
        if (showHostStats) {
          buttons.unshift(HostStats)
        }
        break;
      case MonitorConstants.TYPE_NESTED:
        buttons = [ null, Workflow, Search, Mute ]
        break;
      case MonitorConstants.TYPE_SCRIPT:
      case MonitorConstants.TYPE_SCRAPER:
      case MonitorConstants.TYPE_PROCESS:
      case MonitorConstants.TYPE_FILE:
        buttons = [ LastEvent, Workflow, Search, Mute ]
        break;
      default:
        buttons = []
        break;
    }

    if (Array.isArray(buttons)) {
      if (acls.hasAccessLevel('admin')) {
        buttons.splice(1, 0, Edit)
      }
    }

    if (!buttons) return

    buttons.forEach(button => {
      if (!button) return
      let view = new button({ model: this.model })
      view.render()

      let li = document.createElement('li')
      li.appendChild(view.el)
      container.appendChild(li)
    })
  }
})

exports.Edit = Edit
exports.HostStats = HostStats
exports.LastEvent = LastEvent
exports.Search = Search
exports.Workflow = Workflow
