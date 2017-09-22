import BaseView from 'view/base-view'
import AmpersandCollection from 'ampersand-collection'
import CommonButton from 'components/common-button'
import extend from 'lodash/assign'

export default BaseView.extend({
  autoRender: false,
  template: require('./template.hbs'),
  events: {
    'click [data-hook=selectable]': function (event) {
      event.stopPropagation()
      this.toggle('selected')
    }
  },
  props: {
    selectable: ['boolean', false, true],
    buttons: ['array', false, function(){ return [] }],
    show: ['boolean', false, true],
    selected: ['boolean', false, false],
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

    if (!Array.isArray(buttons)) {
      console.error('array required')
      return
    }
    if (buttons.length===0) return

    const mobileContainer = this.query('.panel-item-mobile ul.dropdown-menu[data-hook=action-buttons]')
    const desktopContainer = this.query('div.panel-item.icons.panel-item-desktop[data-hook=action-buttons]')

    buttons.forEach(button => {
      // render one for each container view
      this.renderSubview(new button.view(button.params), mobileContainer)
      this.renderSubview(new button.view(button.params), desktopContainer)
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
      yes: 'glyphicon-check',
      no: 'glyphicon-unchecked'
    }],
    show: {
      type: 'toggle'
    },
    tags: {
      type: 'attribute',
      name: 'data-tags',
      selector: '.itemRow'
    }
  }
})
