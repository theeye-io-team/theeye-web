import App from 'ampersand-app'
import View from 'ampersand-view'
import acls from 'lib/acls'
import CreateButton from 'view/page/task/buttons/create'
import OnboardingActions from 'actions/onboarding'

export default View.extend({
  template: `
    <section>
      <div style="text-align:center; font-size:16px;">
        <h2 style="display:inline-block;">You don't have any Task.</h2>
        <h2 data-hook="no-agent">You have to install a Bot before you create a task.</h2>
        <div data-tutorial="task-onboarding" data-hook="create-task" style="display:inline-block">
      </div>
    </section>
  `,
  render () {
    this.renderWithTemplate(this)
    if (acls.hasAccessLevel('admin')) {
      this.listenToAndRun(App.state.dashboard,'change:resourcesDataSynced',() => {
        if (App.state.dashboard.resourcesDataSynced===true) {
          this.stopListening(App.state.dashboard,'change:resourcesDataSynced')
          var createButton = new TutorialCreateButton({
            className: 'btn btn-default'
          })
          this.renderSubview(createButton, this.queryByHook('create-task'))
        }
      })
    }

    this.listenToAndRun(App.state.dashboard.groupedResources,'add sync reset remove',() => {
      var textElem = this.queryByHook('no-agent')
      var btnElem = this.queryByHook('create-task')
      if(App.state.dashboard.groupedResources.length>0) {
        if (textElem)
          textElem.style.visibility = 'hidden'
        if (btnElem)
          btnElem.style.visibility = ''
      } else {
        if (btnElem)
          btnElem.style.visibility = 'hidden'
        if (textElem)
          textElem.style.visibility = ''
      }
    })
  }
})

const TutorialCreateButton = CreateButton.extend({
  onClick: function(event) {
    App.actions.onboarding.activateOnboarding()
    CreateButton.prototype.onClick.apply(this, arguments)
  }
})
