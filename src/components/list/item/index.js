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
    /**
     *
     * this derived properties need to be redefined in each particular item list view.
     *
     * bind this derived property to the property of the model, so every time the property
     * value changes, this derived property will have the updated value and the list
     * will change accordingly
     *
     */
    tags: {
      fn () {
        console.warn('(tags) you have to define your own')
        return '(tags) redefine in the item view'
      }
    },
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
  addButtons (views) {
    const container = this.queryByHook('action-buttons')
    const self = this
    var buttons = []
    if (!Array.isArray(views)) {
      buttons.push(views)
    } else {
      buttons = views
    }

    if (buttons.length>0) {
      buttons.forEach(btn => {
        self.renderSubview(btn, container)
      })
    }
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
