import App from 'ampersand-app'
import View from 'ampersand-view'
import acls from 'lib/acls'
import NavbarActions from 'actions/navbar'
import OnboardingActions from 'actions/onboarding'
const howto = require('./howto.hbs')

module.exports = View.extend({
  template: `
    <section>
      <div style="text-align:center; font-size:16px;">
        <h2 style="display:inline-block;">You don't have any Monitor</h2>
        <div data-hook="howto-container"></div>
      </div>
    </section>
  `,
  events: {
    'click [data-hook=show-installer]': 'showInstaller',
  },
  showInstaller() {
    OnboardingActions.showOnboarding()
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
