import App from 'ampersand-app'
import View from 'ampersand-view'
import acls from 'lib/acls'

export default View.extend({
  template: `
    <section>
      <h3 class="blue bold">SELF-PROVIDED BOT</h3>
      <i data-hook="start-bot-help"></i>
      <div id="self-provided-installer" class="row border">
        <div data-hook="button" data-tutorial="self-provided-onboarding" class="btn btn-default col-xs-12">
          <i class="fa theeye-robot-solid" style="bottom: 2px; position: relative;"></i>
          <a href="#">Click to start a Bot</a>
        </div>
      </div>
    </section>
  `,
  events: {
    'click [data-hook=button]': 'onClickButton'
  },
  onClickButton (event) {
    event.preventDefault()
    event.stopPropagation()
    if (acls.hasAccessLevel('root')) {
      App.actions.integrations.startBot()
    }
  }
})
