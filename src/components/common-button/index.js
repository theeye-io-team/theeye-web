import BaseView from 'view/base-view'

module.exports = BaseView.extend({
  template: `
    <button>
      <span data-hook="icon-span"></span>
      <i data-hook="title"></i>
    </button>`,
  props: {
    title: 'string',
    className: ['string', false, 'btn btn-default'],
    iconClass: 'string',
    show: ['boolean', false, true]
  },
  bindings: {
    tip: {
      selector: 'button',
      type: 'attribute',
      name: 'title'
    },
    title: {
      hook: 'title'
    },
    show: {
      type: 'toggle'
    },
    className: {
      selector: 'button',
      type: 'attribute',
      name: 'class'
    },
    iconClass: {
      hook: 'icon-span',
      type: 'attribute',
      name: 'class',
    }
  },
  events: {
    click: 'onClickButton'
  },
  onClickButton (event) {
    event.stopPropagation()
    event.preventDefault()
    console.warn('no action defined for this button')
    return
  }
})
