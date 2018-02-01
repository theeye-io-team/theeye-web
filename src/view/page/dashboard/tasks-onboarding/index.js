import App from 'ampersand-app'
import View from 'ampersand-view'
import acls from 'lib/acls'
import CreateButton from 'view/page/task/buttons/create'
import OnboardingActions from 'actions/onboarding'


const TutorialCreateButton = CreateButton.extend({
  onClick: function(event) {
    OnboardingActions.showOnboarding()
    CreateButton.prototype.onClick.apply(this, arguments)
  }
})

module.exports = View.extend({
  template: `
    <section>
      <div style="text-align:center; font-size:16px;">
        <h2>You don't have any Task.</h2>
        <div id="create-task" data-hook="create-task" style="display:inline-block">
      </div>
    </section>
  `,
  render () {
    this.renderWithTemplate(this)
    if (acls.hasAccessLevel('admin')) {
      this.listenToAndRun(App.state.dashboard,'change:resourcesDataSynced',() => {
        if (App.state.dashboard.resourcesDataSynced===true) {
          this.stopListening(App.state.dashboard,'change:resourcesDataSynced')
          if (App.state.resources.length !== 0) {
            var createButton = new TutorialCreateButton({
              className: 'btn btn-default'
            })
            this.renderSubview(createButton, this.queryByHook('create-task'))
          } else {
            this.queryByHook('create-task').innerHTML = "<h2>You have to install an agent before you create a task.</h2>"
          }
        }
      })
    }
  }
})
