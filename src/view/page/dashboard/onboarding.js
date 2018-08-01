import App from 'ampersand-app'
import bootbox from 'bootbox'
import OnboardingActions from 'actions/onboarding'
import State from 'ampersand-state'
import NavbarActions from 'actions/navbar'
import hopscotch from 'hopscotch'
import 'hopscotch/dist/css/hopscotch.min.css'
import acls from 'lib/acls'
import TaskCreationWizard from 'view/page/task/creation-wizard'

module.exports = State.extend({
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
          target: "monitor-accordion",
          title: "Hello!",
          content: "You don't have any monitor yet.",
          placement: "right",
          zindex: 998,
        },
        {
          target: "show-installer",
          title: "Bot installation",
          content: "First thing you need is to install a bot, let's check the bot installation tutorial.",
          placement: "right",
          yOffset: -20,
          zindex: 998,
          showNextButton: false,
          showCTAButton: true,
          ctaLabel: 'Done',
          onCTA: function() {
            OnboardingActions.showOnboarding()
            NavbarActions.toggleSettingsMenu()
            NavbarActions.toggleTab('installer')
            hopscotch.endTour(true)
          }
        }
      ],
      showCloseButton: true,
      onClose: function() {
        self.active = false
        return
      },
      onEnd: function() {
        self.active = false
        return
      },
      onError: function() {
        self.active = false
        return
      }
    }

    hopscotch.endTour(true)
    hopscotch.startTour(monitorTour)
  },
  showTaskOnboarding() {
    var self = this
    var taskTour = {
      id: "taskTour",
      steps: [
        {
          target: "create-task",
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
        self.active = false
        return
      },
      onEnd: function() {
        self.active = false
        return
      },
      onError: function() {
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
      if (App.state.session.user.onboardingCompleted===true) {
        return
      }

      if (!acls.hasAccessLevel('admin')) {
        return
      }
      if(App.state.resources.length > 0 && App.state.tasks.length > 0) {
        return
      }

      this.active = true
      var message = ''
      if(App.state.resources.length == 0) {
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
              OnboardingActions.updateOnboarding(false)
              OnboardingActions.showOnboarding()
            }
          },
          cancel: {
            label: 'No, thanks',
            className: 'btn-danger',
            callback () {
              this.active = false
              OnboardingActions.updateOnboarding(true)
              OnboardingActions.hideOnboarding()
            }
          },
          later: {
            label: 'Remind me later',
            className: 'btn-default',
            callback () {
              this.active = false
              OnboardingActions.hideOnboarding()
            }
          }
        }
      })
    }
  }
})
