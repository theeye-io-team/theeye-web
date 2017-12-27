import View from 'ampersand-view'
import acls from 'lib/acls'
const howto = require('./howto.hbs')
import CreateButton from 'view/page/task/buttons/create'

module.exports = View.extend({
  template: `
    <section>
      <div style="text-align:center; font-size:16px;">
        <h2>You don't have any Task.</h2>
        <div data-hook="howto-container"></div>
      </div>
    </section>
  `,
  render () {
    this.renderWithTemplate(this)

    if (acls.hasAccessLevel('admin')) {
      this.queryByHook('howto-container').innerHTML = howto()
    }

    this.renderSubview(new CreateButton(), this.queryByHook('create-task'))
  }
})
