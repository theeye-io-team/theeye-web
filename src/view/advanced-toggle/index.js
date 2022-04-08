import View from 'ampersand-view'
import './styles.less'

export default View.extend({
  template: `
    <div class="advanced-section-toggle form-group">
      <div class="col-sm-12">
        <div>
          <label><a>Advanced Options</a></label>
        </div>
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
    'click a': function (event) {
      this.toggle('folded')
      this.onclick && this.onclick(event, this)
    }
  },
  click () {
    this.query('a').click()
  },
  setValue (value) {
    // this is required to behave as InputView (interface)
    return
  }
})
