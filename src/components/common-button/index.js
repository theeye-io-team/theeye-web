import BaseView from 'view/base-view'

module.exports = BaseView.extend({
  template: `
    <button>
      <span data-hook="icon-span"></span>
    </button>`,
  props: {
    title: 'string',
    className: ['string', false, 'btn btn-default'],
    iconClass: 'string',
    show: ['boolean', false, true]
  },
  bindings: {
    title: {
      type: 'attribute',
      name: 'title'
    },
    show: {
      type: 'toggle'
    },
    className: {
      type: 'attribute',
      name: 'class'
    },
    iconClass: {
      type: 'attribute',
      name: 'class',
      hook: 'icon-span'
    }
  },
  events: {
    click: 'onClickButton'
  },
  onClickButton (event) {
    event.stopPropagation()
    event.preventDefault()
    return
  }
})
