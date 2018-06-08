import App from 'ampersand-app'
import acls from 'lib/acls'
import View from 'ampersand-view'
import JobOutput from './job-output'
import SearchActions from 'actions/searchbox'
import ResourceActions from 'actions/resource'
import MonitorConstants from 'constants/monitor'
import MonitorEditView from 'view/page/monitor/edit'
import HelpMessages from 'language/help'

const Mute = View.extend({
  template: `
    <button class="btn btn-primary tooltiped" data-hook="mute-toggler">
      <i class="fa" aria-hidden="true"></i>
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
      type: 'attribute',
      name: 'title',
      hook: 'mute-toggler'
    }
  },
  events: {
    'click button[data-hook=mute-toggler]':'onClickButton'
  },
  onClickButton: function(event){
    event.stopPropagation();
    event.preventDefault();

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
    <button class="btn btn-primary tooltiped" title="Edit Monitors" data-hook="edit">
      <i class="fa fa-edit" aria-hidden="true"></i>
    </button>
  `,
  events: {
    'click button[data-hook=edit]':'onClickEdit'
  },
  onClickEdit: function(event){
    event.stopPropagation();
    event.preventDefault();
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
    <button class="btn btn-primary tooltiped" title="Workflow" data-hook="workflow">
      <i class="fa fa-sitemap" aria-hidden="true"></i>
    </button>
  `,
  events: {
    'click button[data-hook=workflow]':'onClickWorkflow',
  },
  onClickWorkflow: function(event){
    event.stopPropagation();
    event.preventDefault();
    ResourceActions.workflow(this.model.monitor.id)
    return false;
  },
})

const Search = View.extend({
  template: `
    <button class="btn btn-primary tooltiped" title="Search related elements" data-hook="search">
      <i class="fa fa-search" aria-hidden="true"></i>
    </button>
  `,
  events: {
    'click button[data-hook=search]':'onClickSearch',
  },
  onClickSearch: function(event){
    event.stopPropagation();
    event.preventDefault();
    SearchActions.search(this.model.name)
    return false;
  },
})

const LastEvent = View.extend({
  template: `
    <button class="btn btn-primary tooltiped" title="Last Event" data-hook="last_event">
      <i class="fa fa-file-text-o" aria-hidden="true"></i>
    </button>
  `,
  events: {
    'click button[data-hook=last_event]':'onClickLastEvent',
  },
  onClickLastEvent (event) {
    event.preventDefault();
    event.stopPropagation();

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
    <button class="btn btn-primary tooltiped" title="Host Stats" data-hook="stats">
      <i class="fa fa-bar-chart" aria-hidden="true"></i>
    </button>
  `,
  events: {
    'click button[data-hook=stats]':'onClickStats',
  },
  onClickStats (event) {
    event.stopPropagation();
    event.preventDefault();
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

    this.renderButtonsByMonitorType(this.model.type)
  },
  renderButtonsByMonitorType (type) {
    const container = this.el
    let buttons

    switch (type) {
      case MonitorConstants.TYPE_HOST:
        buttons = [ HostStats, Workflow, Search, Mute ]
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
