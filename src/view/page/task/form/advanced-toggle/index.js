import View from 'ampersand-view'
import './styles.less'

module.exports = View.extend({
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
    name: ['string',false,'advanced-toggler']
  },
  session: {
    valid: ['boolean',false,true]
  },
  events: {
    'click': function (event) {
      if (this.onclick) this.onclick(event)
    }
  }
})
