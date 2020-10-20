import View from 'ampersand-view'
import './styles.less'

export default View.extend({
  template: `
    <div class="advanced-section-toggle form-group">
      <div class="col-sm-12">
        <div>
          <label>Advanced Options</label>
        </div>
      </div>
    </div>
  `,
  props: {
    onclick: 'any',
    name: ['string',false,'advanced-toggler'],
    folded: ['boolean', false, false]
  },
  session: {
    valid: ['boolean',false,true]
  },
  events: {
    'click': function (event) {
      this.toggle('folded')
      this.onclick && this.onclick(event, this)
    }
  },
  setValue (value) {
    // this is required to behave as InputView (interface)
    return
  }
})
