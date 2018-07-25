import App from 'ampersand-app'
import View from 'ampersand-view'
import acls from 'lib/acls'
import NavbarActions from 'actions/navbar'
import OnboardingActions from 'actions/onboarding'
import { startBot } from 'actions/integrations'

module.exports = View.extend({
  template: `
    <section>
      <div style="text-align:center; font-size:16px;">
        <h2 style="display:inline-block;">You don't have any Monitor yet</h2><br/>
        <h2 style="display:inline-block;">A Bot must be running to add monitors</h2>
        <div data-hook="howto-container">
          <div>
            <h2></h2>
            We can start a Bot for you, just click <a style="cursor:pointer;color:#64b1f3" href="#" data-hook="start-bot">here</a><br>
            Or you can also install your own Bots following
            <a href="#" style="cursor:pointer;color:#64b1f3" 
            id="show-installer" 
            data-hook="show-installer">
            this Tutorial
            </a> </h2>
          </div>
        </div>
      </div>
    </section>
  `,
  events: {
    'click [data-hook=show-installer]': 'showInstaller',
    'click [data-hook=start-bot]': 'startBot'
  },
  startBot (event) {
    event.preventDefault()
    event.stopPropagation()
    if (acls.hasAccessLevel('admin')) { startBot() }
  },
  showInstaller (event) {
    event.preventDefault()
    event.stopPropagation()
    OnboardingActions.showOnboarding()
    NavbarActions.toggleSettingsMenu()
    NavbarActions.toggleTab('installer')
  },
  render () {
    this.renderWithTemplate(this)

    if (!acls.hasAccessLevel('admin')) {
      this.queryByHook('howto-container').remove()
    }
  }
})
