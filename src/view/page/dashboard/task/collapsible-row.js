import View from 'ampersand-view'
import TagView from 'components/tag'
import './styles.less'
import HelpIconView from 'components/help-icon'

/**
 * tasks rows
 */
export default View.extend({
  template: `
    <div data-component="task-collapsible-row" class="taskRow">
      <div class="tasks-container panel panel-default">
        <div class="panel-heading"
          role="tab"
          data-hook="panel-heading"> <!-- Collapse Heading Container { -->
          <h4 data-hook="header-icon-container" class="panel-title-icon"></h4>
          <h4 class="panel-title">
            <span class="collapsed"
              data-hook="collapse-toggle"
              data-toggle="collapse"
              data-parent="#task-accordion"
              href="#unbinded"
              aria-expanded="false"
              aria-controls="unbinded">
              <div class="panel-title-content">

                <div class="panel-item name col-xs-10">
                  <span data-hook="tags"></span>
                  <span data-hook="name" title=""></span>
                  <span data-hook="help"></span>
                  <small> > <i data-hook="type"></i> <i data-hook="hostname"></i></small>
                </div>

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

                <!-- HAS SCHEDULE -->
                <div data-hook="has-schedule" class="schedule-icon-container" title="Scheduled">
                  <i class="fa fa-clock-o" aria-hidden="true">
                    <i class="fa fa-exclamation" aria-hidden="true"></i>
                  </i>
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
          <div class="panel-body" style="display:none; text-align:center;" data-hook="collapse-container-body-loader">
            <i class="fa fa-refresh fa-spin"></i> Loading ...
            </div>
          <div class="panel-body" data-hook="collapse-container-body"> </div>
        </div>
        <!-- } END Collapsed Container -->
      </div>
    </div>
  `,
  props: {
    loadingContent: 'boolean',
    collapsed: ['boolean', false, true],
    show: ['boolean', false, true],
    hash: ['string', false, () => { return (new Date()).getTime() } ],
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
        return `collapse_header_${this.hash}_${this.model.id}`
      }
    },
    collapse_container_id: {
      deps: ['model.id'],
      fn () {
        return `collapse_container_${this.hash}_${this.model.id}`
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
    }, {
      hook: 'collapse-container',
      type: 'attribute',
      name: 'aria-labelledby'
    }],
    collapse_container_id: [{
      hook: 'collapse-toggle',
      type: 'attribute',
      name: 'aria-controls'
    }, {
      hook: 'collapse-container',
      type: 'attribute',
      name: 'id'
    }],
    row_text: [{
      hook: 'name'
    }, {
      hook: 'name',
      type: 'attribute',
      name: 'title'
    }],
    type_icon: {
      type: 'attribute',
      name: 'class',
      hook: 'type-icon'
    },
    'model.image': {
      hook: 'header-icon-container',
      type: function (el, value) {
        console.log({value})
        if (value) {
          el.innerHTML = `
            <img class="image-icon" src="${this.model.image}"></img>
          `
        } else {
          el.innerHTML = `
            <i class="${this.header_type_icon}" data-hook="header-icon"></i>
          `
        }
      }
    },
    type: { hook: 'type' },
    description: { hook: 'description' },
    hostname: { hook: 'hostname' },
    'model.hasSchedules': {
      type: 'toggle',
      hook: 'has-schedule'
    },
    'model.hasDisabledSchedules': {
      type: 'booleanClass',
      hook: 'has-schedule',
      yes: 'red',
      no: ''
    }
  },
  events: {
    'click .collapsed[data-hook=collapse-toggle]': function (event) {
      this.onClickToggleCollapse(event)
    }
  },
  // capture and handle open/un-collapse event
  onClickToggleCollapse (event) {
    return
  },
  render () {
    this.renderWithTemplate(this)
    this.renderButtons()
    this.renderTags()
    this.renderHelp()

    //this.on('change:loadingContent', () => {
    //  const loader = this.queryByHook('collapse-container-body-loader')
    //  const content = this.queryByHook('collapse-container-body')

    //  if (this.loadingContent === true) {
    //    loader.style.display = 'block'
    //    content.style.display = 'none'
    //  } else {
    //    loader.style.display = 'none'
    //    content.style.display = 'block'
    //  }
    //})

    const $collapse = $(this.el)

    $collapse.on('show.bs.collapse', (event) => {
      const toggle = this.queryByHook('panel-heading')
      const tEl = event.target

      if (toggle.id.split('_')[3] !== tEl.id.split('_')[3]) { return }

      this.collapsed = false
      this.renderCollapsedContent()
    })

    $collapse.on('hidden.bs.collapse', (event) => {
      const toggle = this.queryByHook('panel-heading')
      const tEl = event.target

      if (toggle.id.split('_')[3] !== tEl.id.split('_')[3]) { return }

      this.collapsed = true
      this.removeCollapsedContent()
    })
  },
  renderButtons () {
    return
  },
  renderCollapsedContent () {
    return
  },
  removeCollapsedContent () {
    this.collapsedContent?.remove()
  },
  renderTags () {
    if (this.model.tagsCollection) {
      this.renderCollection(
        this.model.tagsCollection,
        TagView,
        this.queryByHook('tags')
      )
    }
  },
  renderHelp () {
    let icon = new HelpIconView({
      color: [255,255,255],
      category: 'task_row_help',
      text: this.model.description || 'Add Description'
    })

    this.renderSubview(icon, this.queryByHook('help'))

    this.listenTo(this.model, 'change:description', () => {
      icon.el.setAttribute('data-original-title', this.model.description)
    })
  }
})
