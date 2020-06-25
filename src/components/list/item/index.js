import BaseView from 'view/base-view'
// import AmpersandCollection from 'ampersand-collection'
// import CommonButton from 'components/common-button'
// import extend from 'lodash/assign'

export default BaseView.extend({
  autoRender: false,
  template () {
    let html = `
      <div class="itemRow panel panel-default js-searchable-item"
        data-item-id="${this.model.id}"
        data-item-name="model.username"
        data-tags="view.tags">
        <div class="panel-heading" role="tab" id="heading_${this.model.id}">
          <h4 class="panel-title">
            <span class="collapsed" data-toggle="collapse"
              data-parent="#new-accordion"
              href="#collapse_${this.model.id}"
              aria-expanded="false"
              aria-controls="collapse_${this.model.id}">
              <div class="panel-title-content">
                <!-- model select button -->
                <span data-hook="left-container">
                  <button class="btn btn-primary rowSelector">
                    <span data-hook="selectable" class="fa fa-square-o"></span>
                  </button>
                </span>
                <span class="panel-item name">
                  <span data-hook="item_badge"></span>
                  <span data-hook="item_name"></span>
                  <small> <span data-hook="item_description"></span> </small>
                </span>
                <div data-hook="dropdown-icons" class="panel-item icons dropdown">
                  <button class="btn dropdown-toggle btn-primary"
                    type="button"
                    data-hook="buttons-container"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="true">
                    <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
                  </button>
                  <ul class="dropdown-menu" data-hook="action-buttons">
                  </ul>
                </div>
                <div data-hook="detached-icons" class="panel-item icons"></div>
              </div>
            </span>
          </h4>
        </div>
        <!-- collapsible content -->
        <div id="collapse_${this.model.id}"
          class="panel-collapse collapse"
          role="tabpanel"
          aria-labelledby="heading_${this.model.id}">
          <div data-hook="collapsed-content" class="panel-body"> </div>
        </div>
      </div>
      `

    return html
  },
  events: {
    'click [data-hook=selectable]': function (event) {
      event.stopPropagation()
      this.toggle('selected')
    }
  },
  props: {
    selectable: ['boolean', false, true],
    buttons: ['array', false, function () { return [] }],
    showButtons:['boolean', false, true],
    show: ['boolean', false, true],
    selected: ['boolean', false, false]
  },
  derived: {
    item_name: {
      fn () {
        console.warn('(name) you have to define your own')
        return '(name) redefine in the item view'
      }
    },
    item_description: {
      fn () {
        console.warn('(description) you have to define your own')
        return '(description) redefine in the item view'
      }
    }
  },
  addButtons (buttons) {
    const self = this

    if (!buttons) {
      throw new Error('need buttons to add')
    }

    if (!Array.isArray(buttons)) {
      throw new Error('buttons are not buttons..')
    }

    if (buttons.length===0) {
      throw new Error('at least give me one button')
    }

    const buttonsContainer = this.query('.panel-item ul.dropdown-menu[data-hook=action-buttons]')

    buttons.forEach(button => {
      let btn
      if (typeof button === 'function') {
        btn = button() // eval button function
      } else { btn = button }

      if (!btn) return

      // render one for each container view
      this.renderSubview(new button.view(button.params), buttonsContainer)
    })
  },
  // most of these bindings should be removed over time
  // to migrate from a jquery scriptage to a reactive UI (model rules)
  // there is no point in storing vars in data-* attributes anymore
  bindings: {
    'model.id': [{
      type: 'attribute',
      name: 'data-item-id',
      selector: '.itemRow'
    }, {
      // these are needed bindings on id attribute for the collapsible to work
      type: function (el, value, previousValue) {
        el.setAttribute('id', 'heading' + value)
      },
      selector: 'div.panel-heading'
    }, {
      type: function (el, value, previousValue) {
        el.setAttribute('id', 'collapse' + value)
        el.setAttribute('aria-labelledby', 'heading' + value)
      },
      selector: 'div.panel-collapse'
    }, {
      type: function (el, value, previousValue) {
        el.setAttribute('href', '#collapse' + value)
        el.setAttribute('aria-controls', 'collapse' + value)
      },
      selector: 'span.collapsed'
    }], // end collapsible bindings
    item_name: {
      hook: 'item_name'
    },
    item_description: {
      hook: 'item_description'
    },
    selectable: {
      type: 'toggle',
      hook: 'left-container'
    },
    selected: [{
      type: 'booleanClass',
      name: 'selectedItem'
    }, {
      hook: 'selectable',
      type: 'booleanClass',
      yes: 'fa-check-square-o',
      no: 'fa-square-o'
    }],
    show: {
      type: 'toggle'
    },
    showButtons: {
      type: 'toggle',
      hook: 'buttons-container'
    },
    tags: {
      type: 'attribute',
      name: 'data-tags',
      selector: '.itemRow'
    }
  }
})
