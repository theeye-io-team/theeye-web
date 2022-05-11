import App from 'ampersand-app'
import bootbox from 'bootbox'
import State from 'ampersand-state'
import hopscotch from 'hopscotch'
import 'hopscotch/dist/css/hopscotch.min.css'
import acls from 'lib/acls'
import TaskCreationWizard from 'view/page/task/creation-wizard'
import * as TabsConstants from 'constants/tabs'

export default State.extend({
  props: {
    active: ['boolean',false,false]
  },
  initialize() {
    this.listenToAndRun(App.state.dashboard,'change:tasksDataSynced change:resourcesDataSynced',() => {
      if (App.state.dashboard.resourcesDataSynced===true && App.state.dashboard.tasksDataSynced===true) {
        this.stopListening(App.state.dashboard,'change:tasksDataSynced')
        this.stopListening(App.state.dashboard,'change:resourcesDataSynced')

        this.onboardingStart()
      }
    })
  },
  showMonitorOnboarding() {
    var self = this
    var monitorTour = {
      id: "monitorTour",
      steps: [
        {
          target: document.querySelectorAll('[data-tutorial=monitor-onboarding]')[0],
          title: "Hello!",
          content: "You don't have any monitor yet.",
          placement: "right",
          yOffset: -20,
          zindex: 998,
        },
        {
          target: document.querySelectorAll('[data-tutorial=monitor-onboarding]')[1],
          title: "Bot installation",
          content: "First thing you need is to install a bot, let's check the bot installation tutorial.",
          placement: "right",
          yOffset: -20,
          zindex: 998,
          showNextButton: false,
          showCTAButton: true,
          ctaLabel: 'Done',
          onCTA: function() {
            App.actions.onboarding.activateOnboarding()
            App.actions.settingsMenu.show('customer')
            App.actions.settingsMenu.toggleTab('customer','installer')
            hopscotch.endTour(true)
          }
        }
      ],
      showCloseButton: true,
      onClose: function() {
        App.actions.onboarding.hideOnboarding()
        self.active = false
        return
      },
      onEnd: function() {
        App.actions.onboarding.hideOnboarding()
        self.active = false
        return
      },
      onError: function() {
        App.actions.onboarding.hideOnboarding()
        self.active = false
        return
      }
    }

    hopscotch.endTour(true)
    hopscotch.startTour(monitorTour)
  },
  showTaskOnboarding() {
    App.actions.tabs.setCurrentTab(TabsConstants.WORKFLOWS)
    var self = this
    var taskTour = {
      id: "taskTour",
      steps: [
        {
          target: document.querySelectorAll('[data-tutorial=task-onboarding]')[0],
          title: "Hello again!",
          content: "You don't have any task yet. Let's create a simple 'Hello World' task. Click here to start the task tutorial!",
          placement: "left",
          yOffset: -20,
          delay: 500,
          zindex: 998,
          showNextButton: false,
          showCTAButton: true,
          ctaLabel: 'Next',
          onCTA: function () {
            hopscotch.endTour(true)
            let wizard = new TaskCreationWizard()
          }
        }
      ],
      showCloseButton: true,
      onClose: function() {
        App.actions.onboarding.hideOnboarding()
        self.active = false
        return
      },
      onEnd: function() {
        App.actions.onboarding.hideOnboarding()
        self.active = false
        return
      },
      onError: function() {
        App.actions.onboarding.hideOnboarding()
        self.active = false
        return
      }
    }

    hopscotch.endTour(true)
    hopscotch.startTour(taskTour)
  },
  onboardingStart() {
    if(!this.active) {
      var self = this
      if (App.state.session.user.onboardingCompleted === true) { return }

      if (!acls.hasAccessLevel('admin')) { return }

      if(App.state.resources.length > 0 && App.state.tasks.length > 0) { return }

      this.active = true
      let message = ''

      if (App.state.resources.length == 0) {
        message = "You don't have any monitors, do you wan't to see the bot installation tutorial?"
      } else {
        message = "Your Bot is up and running!, would you like to see the task creation tutorial next?"
      }

      bootbox.dialog({
        title: 'Tutorial',
        message: message,
        closeButton: false,
        buttons: {
          confirm: {
            label: 'Start tutorial',
            className: 'btn-primary',
            callback () {
              if (App.state.resources.length === 0) {
                self.showMonitorOnboarding()
              } else {
                self.showTaskOnboarding()
              }
              //App.actions.onboarding.updateOnboarding(false)
              App.actions.onboarding.activateOnboarding()
            }
          },
          cancel: {
            label: 'No, thanks',
            className: 'btn-danger',
            callback () {
              this.active = false
              App.actions.onboarding.onboardingCompleted()
            }
          },
          later: {
            label: 'Remind me later',
            className: 'btn-default',
            callback () {
              this.active = false
              App.actions.onboarding.hideOnboarding()
            }
          }
        }
      })
    }
  }
})
