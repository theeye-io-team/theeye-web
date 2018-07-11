import BaseView from 'view/base-view'
import AmpersandCollection from 'ampersand-collection'
import CommonButton from 'components/common-button'
import extend from 'lodash/assign'

const MassSelectorButton = CommonButton.extend({
  props: {
    checked: 'boolean'
  },
  events: {
    click: 'onclick'
  },
  initialize () {
    CommonButton.prototype.initialize.apply(this,arguments)
    this.iconClass = 'fa'
  },
  onclick (event) {
    event.stopPropagation()
    this.toggle('checked')
  },
  bindings: extend({}, CommonButton.prototype.bindings, {
    checked: {
      type: 'booleanClass',
      selector: 'span',
      yes: 'fa-check-square-o',
      no: 'fa-square-o'
      //yes: 'fa-check-square-o',
      //no: 'fa-square-o'
    }
  })
})

module.exports = BaseView.extend({
  autoRender: false,
  template: require('./template.hbs'),
  props: {
    title: ['string', false, 'Items'],
    massiveSelector: ['boolean', false, true],
  },
  bindings: {
    title: { hook: 'title' },
    massiveSelector: {
      hook: 'left-container',
      type: 'toggle'
    }
  },
  render () {
    this.renderWithTemplate(this)
    
    var massSelector = new MassSelectorButton({
      tip: 'Select all',
      className: 'btn btn-primary rowSelector',
      iconClass: 'fa fa-square-o'
    })

    this.listenTo(massSelector,'change:checked',() => {
      if (massSelector.checked) {
        this.parent.selectAllRows()
      } else {
        this.parent.deselectAll()
      }
    })

    this.renderSubview(massSelector, this.queryByHook('left-container'))
  },
  addMainButton (buttons) {
    const container = this.queryByHook('main-buttons-container')
    return this.renderButtons(buttons,container)
  },
  addMassiveButton (buttons) {
    const container = this.queryByHook('massive-buttons-container')
    return this.renderButtons(buttons,container)
  },
  renderButtons (buttons,container) {
    if (Array.isArray(buttons)) {
      if (buttons.length>0) {
        buttons.forEach(button => {
          this.renderSubview(button, container)
        })
      }
    } else {
      if (typeof buttons.render === 'function') {
        this.renderSubview(buttons, container)
      }
    }
  }
})
