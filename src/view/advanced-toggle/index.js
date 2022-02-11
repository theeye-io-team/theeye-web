import View from 'ampersand-view'
import './styles.less'

export default View.extend({
  template: `
    <div class="advanced-section-toggle form-group">
      <div class="col-sm-12">
      <button data-hook="btn" class="btn btn-default">
        Advanced Options
      </button>
      </div>
    </div>
  `,
  props: {
    onclick: 'any',
    name: ['string',false,'advanced-toggler'],
    folded: ['boolean', false, true]
  },
  session: {
    valid: ['boolean',false,true]
  },
  events: {
    'click [data-hook=btn]': function (event) {
      this.toggle('folded')
      this.onclick && this.onclick(event, this)
    }
  },
  setValue (value) {
    // this is required to behave as InputView (interface)
    return
  }
})
