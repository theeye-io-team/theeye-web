import View from 'ampersand-view'

/**
 * tasks rows
 */
module.exports = View.extend({
  template: require('./row.hbs'),
  props: {
    show: ['boolean',false,true]
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
    description: {
      deps: ['model.description'],
      fn () {
        return this.model.description || 'no description'
      }
    },
    type: {
      deps: ['model._type'],
      fn () {
        return 'not defined'
      }
    },
    type_icon: {
      deps: ['model._type'],
      fn () {
        return 'not defined'
      }
    },
    header_type_icon: {
      deps: ['model._type'],
      fn () {
        return 'not defined'
      }
    }
  },
  bindings: {
    'model.name': { hook: 'name' },
    type_icon: {
      type: 'attribute',
      name: 'class',
      hook: 'type-icon'
    },
    header_type_icon: {
      type: 'attribute',
      name: 'class',
      hook: 'header-icon'
    },
    type: { hook: 'type' },
    description: { hook: 'description' },
    hostname: { hook: 'hostname' },
    show: { type: 'toggle' }
  },
  events: {
    'click .collapsed[data-hook=collapse-toggle]': 'onClickToggleCollapse'
  },
  // capture and handle collapse event
  onClickToggleCollapse (event) {
    return
  },
  render () {
    this.renderWithTemplate()
    this.renderButtons()
    this.renderCollapsedContent()
  },
  renderButtons () {
    return
  },
  renderCollapsedContent () {
    return
  }
})

