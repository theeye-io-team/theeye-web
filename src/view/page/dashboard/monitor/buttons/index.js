import View from 'ampersand-view'
import JobOutput from 'view/page/dashboard/job-output'
import SearchActions from 'actions/searchbox'
import ResourceActions from 'actions/resource'
import HostActions from 'actions/host'

export const Edit = View.extend({
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
    ResourceActions.edit(this.model.id)
    return false;
  }
})

export const Workflow = View.extend({
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

export const Search = View.extend({
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

export const LastEvent = View.extend({
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

export const HostStats = View.extend({
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
    HostActions.stats(this.model.host_id)
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

    if (type == 'host') {
      buttons = [ HostStats, Edit, Workflow, Search ]
    }
    else if (['script','scraper','process','file'].indexOf(type) !== -1) {
      buttons = [ LastEvent, Edit, Workflow, Search ]
    }

    if (!buttons) return

    buttons.forEach(button => {
      let view = new button({ model: this.model })
      view.render()

      let li = document.createElement('li')
      li.appendChild( view.el )
      container.appendChild(li)
    })
  }
})
