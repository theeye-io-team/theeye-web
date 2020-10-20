import View from 'ampersand-view'
import { Dismiss, Integration, Edit } from 'view/page/indicator/buttons'

export default View.extend({
  template: `
    <div data-component="buttons-menu" class="panel-item icons dropdown">
      <button class="btn dropdown-toggle btn-primary"
        type="button"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="true">
        <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
      </button>
      <ul data-hook="buttons-container" class="dropdown-menu"></ul>
    </div>
  `,
  render () {
    this.renderWithTemplate(this)

    this.renderSubview(
      new Integration({ model: this.model }),
      this.query('ul')
    )

    this.renderSubview(
      new Edit({ model: this.model }),
      this.query('ul')
    )

    this.renderSubview(
      new Dismiss({ model: this.model }),
      this.query('ul')
    )
  }
})
