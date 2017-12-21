import View from 'ampersand-view'
import acls from 'lib/acls'
import NavbarActions from 'actions/navbar'
const howto = require('./howto.hbs')

module.exports = View.extend({
  template: `
    <section>
      <div style="text-align:center; font-size:16px;">
        <h2>You don't have any Monitor</h2>
        <div data-hook="howto-container"></div>
      </div>
    </section>
  `,
  events: {
    'click [data-hook=show-installer]': 'showInstaller',
  },
  showInstaller() {
    NavbarActions.toggleSettingsMenu()
    NavbarActions.toggleTab('installer')
  },
  render () {
    this.renderWithTemplate(this)

    if (acls.hasAccessLevel('admin')) {
      this.queryByHook('howto-container').innerHTML = howto()
    }
  }
})
