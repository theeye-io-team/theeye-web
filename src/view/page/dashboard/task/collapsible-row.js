import View from 'ampersand-view'

/**
 * tasks rows
 */
module.exports = View.extend({
  template: `
    <div class="taskRow">
      <div class="tasks-container panel panel-default">
        <div class="panel-heading"
          role="tab"
          data-hook="panel-heading"> <!-- Collapse Heading Container { -->
          <h4 class="panel-title-icon"><i data-hook="header-icon"></i></h4>
          <h4 class="panel-title">
            <span class="collapsed"
              data-hook="collapse-toggle"
              data-toggle="collapse"
              data-parent="#task-accordion"
              href="#unbinded"
              aria-expanded="false"
              aria-controls="unbinded">
              <div class="panel-title-content">

                <span class="panel-item name">
                  <span data-hook="name" title=""></span>
                  <small> > <i data-hook="type"></i> <i data-hook="hostname"></i></small>
                </span>

                <div class="panel-item icons dropdown">
                  <button class="btn dropdown-toggle btn-primary"
                    type="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="true">
                    <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
                  </button>
                  <ul data-hook="buttons-container" class="dropdown-menu"></ul>
                </div>

                <!-- RUN TASK BUTTON -->
                <div data-hook="execute-button-container" class="panel-item icons run-task-icon">
                </div>
              </div>
            </span>
          </h4>
        </div> <!-- } END Collapse Heading Container -->

        <!-- Collapsed Container { -->
        <div data-hook="collapse-container"
          id="unbinded"
          class="panel-collapse collapse"
          aria-labelledby="unbinded"
          role="tabpanel">
          <div class="panel-body" data-hook="collapse-container-body"> </div>
        </div>
        <!-- } END Collapsed Container -->
      </div>
    </div>
  `,
  props: {
    collapsed: ['boolean', false, true],
    show: ['boolean',false,true],
  },
  derived: {
    row_text: {
      deps: ['model.name'],
      fn () {
        return this.model.name
      }
    },
    collapse_header_id: {
      deps: ['model.id'],
      fn () {
        return `collapse_header_${this.model.id}`
      }
    },
    collapse_container_id: {
      deps: ['model.id'],
      fn () {
        return `collapse_container_${this.model.id}`
      }
    },
    collapse_toggle_href: {
      deps: ['collapse_container_id'],
      fn () {
        return `#${this.collapse_container_id}`
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
    show: {
      type: 'toggle'
    },
    collapse_toggle_href: {
      hook: 'collapse-toggle',
      type: 'attribute',
      name: 'href'
    },
    collapse_header_id: [{
      hook: 'panel-heading',
      type: 'attribute',
      name: 'id'
    },{
      hook: 'collapse-container',
      type: 'attribute',
      name: 'aria-labelledby'
    }],
    collapse_container_id: [{
      hook: 'collapse-toggle',
      type: 'attribute',
      name: 'aria-controls'
    },{
      hook: 'collapse-container',
      type: 'attribute',
      name: 'id'
    }],
    row_text: [{
      hook: 'name'
    },{
      hook: 'name',
      type: 'attribute',
      name: 'title'
    }],
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
  },
  events: {
    'click .collapsed[data-hook=collapse-toggle]': 'onClickToggleCollapse'
  },
  // capture and handle open/un-collapse event
  onClickToggleCollapse (event) {
    return
  },
  render () {
    this.renderWithTemplate()
    this.renderButtons()
    this.renderCollapsedContent()

    let $el = $(this.query('.panel-collapse.collapse'))
    $el.on('show.bs.collapse', () => { this.collapsed = false })
    $el.on('hide.bs.collapse', () => { this.collapsed = true  })
  },
  //remove () {
  //  View.prototype.remove.apply(this, arguments)
  //},
  renderButtons () {
    return
  },
  renderCollapsedContent () {
    return
  }
})
