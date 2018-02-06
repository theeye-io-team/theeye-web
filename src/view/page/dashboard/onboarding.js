import App from 'ampersand-app'
import bootbox from 'bootbox'
import OnboardingActions from 'actions/onboarding'
import State from 'ampersand-state'
import NavbarActions from 'actions/navbar'
import hopscotch from 'hopscotch'
import 'hopscotch/dist/css/hopscotch.min.css'
import acls from 'lib/acls'

module.exports = State.extend({
  initialize() {
    var self = this
    if(app.state.session.user.onboardingCompleted===true) {
      return
    }

    this.listenToAndRun(App.state.dashboard,'change:tasksDataSynced change:resourcesDataSynced',() => {
      if (App.state.dashboard.resourcesDataSynced===true && App.state.dashboard.tasksDataSynced===true) {
        this.stopListening(App.state.dashboard,'change:tasksDataSynced')
        this.stopListening(App.state.dashboard,'change:resourcesDataSynced')

        if (!acls.hasAccessLevel('admin')) {
          return
        }

        if(App.state.resources.length > 0 && App.state.tasks.length > 0) {
          return
        }

        bootbox.confirm({
          title: 'Tutorial',
          message: "Hello! I see you don't have any monitors or tasks, do you wan't to see the tutorial?",
          closeButton: false,
          buttons: {
            confirm: {
              label: 'Start tutorial',
              className: 'btn-primary'
            },
            cancel: {
              label: 'No, thanks',
              className: 'btn-danger'
            }
          },
          callback (confirm) {
            if(confirm){
              if(App.state.resources.length == 0) {
                self.showMonitorOnboarding()
              } else {
                self.showTaskOnboarding()
              }
            }
            OnboardingActions.updateOnboarding(!confirm)
          }
        })
      }
    })
  },
  showMonitorOnboarding() {
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
          title: "Agent installation",
          content: "First thing you need is to install an agent, let's check the agent installation tutorial.",
          placement: "right",
          yOffset: -20,
          zindex: 998,
          showNextButton: false,
          showCTAButton: true,
          ctaLabel: 'Done',
          onCTA: function() {
            NavbarActions.toggleSettingsMenu()
            NavbarActions.toggleTab('installer')
            hopscotch.endTour(true)
          }
        }
      ],
      showCloseButton: true,
      onClose: function() {
        return
      }
    }

    hopscotch.endTour(true)
    hopscotch.startTour(monitorTour)
  },
  showTaskOnboarding() {
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
          zindex: 998
        }
      ],
      showCloseButton: true,
      onClose: function() {
        return
      }
    }

    hopscotch.endTour(true)
    hopscotch.startTour(taskTour)
  }
})
