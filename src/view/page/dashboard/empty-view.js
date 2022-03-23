import App from 'ampersand-app'
import View from 'ampersand-view'
import Acls from 'lib/acls'
import bootbox from 'bootbox'
import TaskCreationWizard from 'view/page/task/creation-wizard'
import MonitorCreationWizard from 'view/page/monitor/creation-wizard'

import './styles.less'

export default View.extend({
  template: `
    <div class="empty-view">
      <div class="text">
        <img src="/images/bot-duerme-01.png">
        <p data-hook="par1">It looks like your dashboard is empty.</p>
        <p data-hook="par2"></p>
        <div class="btn-container" data-hook="buttons">
          <div class="btn btn-default" data-hook="task-tut">Task creation tutorial</div>
          <div class="btn btn-default" data-hook="bot-tut">Agent installation tutorial</div>
        </div>
      </div>
    </div> 
  `,
  events: {
    'click [data-hook="bot-tut"]':  'onClickBotTut',
    'click [data-hook="task-tut"]': 'onClickTaskTut'
  },
  render () {
    this.renderWithTemplate(this)

    if (Acls.hasAccessLevel('admin')) {
      this.queryByHook('par2').innerText = 'You can click the creation menu (+) to begin, or you can use one of these tutorialas if you don\'t know where to start'
      this.queryByHook('buttons').style.display = 'flex'
    } else {
      this.queryByHook('par2').innerText = 'Please get in touch with an administrator to create new tasks or monitors'
      this.queryByHook('buttons').style.display = 'none'
    }
  },
  onClickTaskTut (event) {
    event.preventDefault()
    event.stopPropagation()

    bootbox.confirm(
      'You\'re about to start the task tutorial. This will guide you through the process of creating a new script task. Do you want to continue?',
      (res) => {
        if (res) {
          App.actions.onboarding.activateOnboarding(true)
          let wizard = new TaskCreationWizard()
        }
      }
    )
  },
  onClickBotTut (event) {
    event.preventDefault()
    event.stopPropagation()

    bootbox.confirm(
      'You\'re about to start the agent installation tutorial. This will guide you through the process of installing the agent on a host machine. Do you want to continue?',
      (res) => {
        if (res) {
          App.actions.onboarding.activateOnboarding(true)
          // NavbarActions.toggleTopMenu()
          App.actions.settingsMenu.show('customer')          
        }
      }
    )
  }
})