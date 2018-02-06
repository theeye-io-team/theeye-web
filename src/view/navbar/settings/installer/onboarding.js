import bootbox from 'bootbox'
import NavbarActions from 'actions/navbar'
import OnboardingActions from 'actions/onboarding'
import hopscotch from 'hopscotch'
import 'hopscotch/dist/css/hopscotch.min.css'

var showOnboarding = function(platform) {
  var steps = []
  if(platform === 'linux') {
    var el = document.getElementById("linux-installer");
    el.scrollIntoView();

    steps = [
      {
        target: document.querySelectorAll('[data-tutorial=linux-onboarding]')[0],
        title: "Linux Agent installation",
        content: "First of all, open a CMD console.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=linux-onboarding]')[1],
        title: "Linux Agent installation",
        content: "Make sure you got administration privilegies in order to run the installation.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=linux-onboarding]')[2],
        title: "Linux Agent installation",
        content: "Copy and paste and run the installation script.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=linux-onboarding]')[3],
        title: "Linux Agent installation",
        content: "Wait until the installation is completed.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=linux-onboarding]')[4],
        title: "Linux Agent installation",
        content: "Once installation is completed, you'll see a new monitor on your dashboard.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
    ]
  } else if (platform === 'windows') {

    var el = document.getElementById("windows-installer");
    el.scrollIntoView();

    steps = [
      {
        target: document.querySelectorAll('[data-tutorial=windows-onboarding]')[0],
        title: "Windows Agent installation",
        content: "First of all, open a CMD console.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=windows-onboarding]')[1],
        title: "Windows Agent installation",
        content: "Make sure you got administration privilegies in order to run the installation.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=windows-onboarding]')[2],
        title: "Windows Agent installation",
        content: "Copy and paste and run the installation script.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=windows-onboarding]')[3],
        title: "Windows Agent installation",
        content: "Wait until the installation is completed.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=windows-onboarding]')[4],
        title: "Windows Agent installation",
        content: "Once installation is completed, you'll see a new monitor on your dashboard.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
    ]
  }

  var installerTour = {
    id: "installerTour",
   steps: steps,
    showCloseButton: true,
    onClose: function() {
      return
    }
  }

  hopscotch.endTour(true)
  hopscotch.startTour(installerTour)
}

module.exports = {
  start() {
    bootbox.dialog({
      title: 'Tutorial',
      message: "Which platform installer tutorial do you want to check?",
      closeButton: false,
      buttons: {
        linux: {
          label: 'Linux',
          className: 'btn-primary',
          callback () {
            showOnboarding('linux')
          }
        },
        windows: {
          label: 'Windows',
          className: 'btn-primary',
          callback () {
            showOnboarding('windows')
          }
        }
      }
    })
  }
}
