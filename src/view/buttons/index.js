import View from 'ampersand-view'
import './buttons.less'
export default View.extend({
  template: `
    <div class="form-buttons" data-hook="buttons-container">
      <div class="row">
        <div class="col-xs-12 col-md-6">
          <button type="button" class="btn btn-default" data-hook="cancel">Cancel</button>
        </div>
        <div class="col-xs-12 col-md-6">
          <button type="button" class="btn btn-primary" data-hook="confirm">
        </div>
        </button>
      </div>
    </div>
  `,
  props: {
    confirmText: ['string',false,'Confirm']
  },
  bindings: {
    confirmText: {
      hook: 'confirm'
    }
  },
  events: {
    //'click [data-hook=cancel]':'onClickCancel',
    'click [data-hook=confirm]':'onClickConfirm'
  },
  //onClickCancel (event) {
  //  event.preventDefault()
  //  event.stopPropagation()
  //  this.trigger('click:cancel')
  //},
  onClickConfirm (event) {
    event.preventDefault()
    event.stopPropagation()
    this.trigger('click:confirm')
  }
})
