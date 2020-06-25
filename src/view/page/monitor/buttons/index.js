import App from 'ampersand-app'
import View from 'ampersand-view'
import EditView from 'view/page/monitor/edit'
import HelpMessages from 'language/help'
import PanelButton from 'components/list/item/panel-button'
import bootbox from 'bootbox'
import $ from 'jquery'

export const Edit = View.extend({
  template: `
    <button class="btn btn-primary" title="Edit Monitors" data-hook="edit">
      <i class="fa fa-edit dropdown-icon" aria-hidden="true"></i>
      <span>Edit monitor</span>
    </button>
  `,
  events: {
    'click button[data-hook=edit]':'onClickEdit'
  },
  onClickEdit (event) {
    event.stopPropagation()
    event.preventDefault()
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    new EditView(this.model)
    //if (this.model.type === MonitorConstants.TYPE_NESTED) {
    //  let view = new EditView(this.model)
    //} else {
    //  ResourceActions.edit(this.model.id)
    //}
    return false;
  }
})

export const Mute = View.extend({
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
  onClickButton (event) {
    event.stopPropagation();
    event.preventDefault();
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    if (this.is_muted) {
      App.actions.resource.unmute(this.model.id)
    } else {
      App.actions.resource.mute(this.model.id)
    }

    return false;
  }
})

export const Workflow = View.extend({
  template: `
    <button class="btn btn-primary" title="Workflow" data-hook="workflow">
      <i class="fa fa-sitemap dropdown-icon" aria-hidden="true"></i>
      <span>Show workflow</span>
    </button>
  `,
  events: {
    'click button[data-hook=workflow]':'onClickWorkflow'
  },
  onClickWorkflow (event) {
    event.stopPropagation();
    event.preventDefault();
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    App.actions.resource.workflow(this.model.monitor.id)
    return false
  }
})

export const Search = View.extend({
  template: `
    <button class="btn btn-primary" title="Search related elements" data-hook="search">
      <i class="fa fa-search dropdown-icon" aria-hidden="true"></i>
      <span>Search related</span>
    </button>
  `,
  events: {
    'click button[data-hook=search]':'onClickSearch',
  },
  onClickSearch (event) {
    event.stopPropagation()
    event.preventDefault()
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')
    App.actions.searchbox.search(this.model.name)
    return false
  }
})

export const Remove = PanelButton.extend({
  initialize (options) {
    this.title = 'Delete Monitor'
    this.iconClass = 'fa fa-trash dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    'click': 'onClickButton'
  },
  onClickButton (event) {
    event.stopPropagation()
    event.preventDefault()

    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    const msg = `The monitor ${this.model.name} will be removed. Continue?`
    bootbox.confirm(msg, (confirmed) => {
      if (!confirmed) { return }
      App.actions.resource.remove(this.model.id)
    })
  }
})

export const HostStats = View.extend({
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
    event.stopPropagation()
    event.preventDefault()
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')

    // esto no es un action, deberia ser un navigate nomas
    // HostActions.stats(this.model.host_id)
    App.navigate('/admin/hoststats/' + this.model.host_id)
    return false
  }
})
