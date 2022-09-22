import View from 'ampersand-view'
import './buttons.less'
export default View.extend({
  template: `
    <div data-component="form-buttons"
      style="text-align: right;"
      data-hook="buttons-container">
      <div>
        <button type="button"
          class="btn btn-primary"
          data-hook="confirm">
        </button>
      </div>
      <div>
        <button type="button"
          class="btn btn-default"
          data-hook="cancel">
        </button>
      </div>
    </div>
  `,
  props: {
    confirmText: ['string', false, 'Confirm'],
    cancelText: ['string', false, 'Cancel'],
    confirmAction: ['any', false, null]
  },
  bindings: {
    confirmText: {
      hook: 'confirm'
    },
    cancelText: {
      hook: 'cancel'
    }
  },
  events: {
    'click [data-hook=confirm]':'onClickConfirm'
  },
  onClickConfirm (event) {
    if (this.confirmAction === null) {
      event.preventDefault()
      event.stopPropagation()
      this.trigger('click:confirm')
    }
  }
})
