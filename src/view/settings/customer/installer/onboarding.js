import bootbox from 'bootbox'
import OnboardingActions from 'actions/onboarding'
import hopscotch from 'hopscotch'
import 'hopscotch/dist/css/hopscotch.min.css'
import disableScroll from 'disable-scroll'

var showPlatformOnboarding = function(platform) {
  var steps = []
  if(platform === 'linux') {
    var el = document.getElementById("linux-installer");
    el.scrollIntoView();

    steps = [
      {
        target: document.querySelectorAll('[data-tutorial=linux-onboarding]')[0],
        title: "Linux Bot installation",
        content: "First of all, open a Terminal.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=linux-onboarding]')[1],
        title: "Linux Bot installation",
        content: "Make sure you have got administrator privileges in order to run the installation.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=linux-onboarding]')[2],
        title: "Linux Bot installation",
        content: "Copy/paste and run the installation script.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=linux-onboarding]')[3],
        title: "Linux Bot installation",
        content: "Wait until the installation is completed.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=linux-onboarding]')[4],
        title: "Linux Bot installation",
        content: "Once installation is completed, you'll see it appears in your dashboard.",
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
        title: "Windows Bot installation",
        content: "First of all, open a CMD console.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=windows-onboarding]')[1],
        title: "Windows Bot installation",
        content: "Make sure you have got administrator privileges in order to run the installation.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=windows-onboarding]')[2],
        title: "Windows Bot installation",
        content: "Copy and paste and run the installation script.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=windows-onboarding]')[3],
        title: "Windows Bot installation",
        content: "Wait until the installation is completed.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=windows-onboarding]')[4],
        title: "Windows Bot installation",
        content: "Once installation is completed, you'll see it appears in your dashboard.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
    ]
  } else if (platform === 'docker') {

    var el = document.getElementById("docker-installer");
    el.scrollIntoView();

    steps = [
      {
        target: document.querySelectorAll('[data-tutorial=docker-onboarding]')[0],
        title: "Docker Bot installation",
        content: "First of all, open a CMD console.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=docker-onboarding]')[1],
        title: "Docker Bot installation",
        content: "Make sure you have got administrator privileges in order to run the installation.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=docker-onboarding]')[2],
        title: "Docker Bot installation",
        content: "Copy and paste and run the installation script.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=docker-onboarding]')[3],
        title: "Docker Bot installation",
        content: "Wait until the installation is completed.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=docker-onboarding]')[4],
        title: "Docker Bot installation",
        content: "Once installation is completed, you'll see it appears in your dashboard.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
    ]
  } else if (platform === 'self-provided') {
    steps = [
      {
        target: document.querySelectorAll('[data-tutorial=self-provided-onboarding]')[0],
        title: "Self-Provided Bot installation",
        content: "Click here to start a Self-Provided Bot.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
    ]
  } else if (platform === 'aws') {
    var el = document.getElementById("aws-installer");
    el.scrollIntoView();

    steps = [
      {
        target: document.querySelectorAll('[data-tutorial=aws-onboarding]')[0],
        title: "AWS Bot installation",
        content: "First of all, open the AWS console.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=aws-onboarding]')[1],
        title: "AWS Bot installation",
        content: "Copy the following user-data.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=aws-onboarding]')[2],
        title: "AWS Bot installation",
        content: "Launch your instances.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=aws-onboarding]')[3],
        title: "AWS Bot installation",
        content: "Wait until the BOT starts reporting.",
        placement: "left",
        yOffset: -20,
        xOffset: -20
      },
      {
        target: document.querySelectorAll('[data-tutorial=aws-onboarding]')[4],
        title: "AWS Bot installation",
        content: "Once installation is completed, you'll see it appears in your dashboard.",
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
    onStart: function() {
      disableScroll.on()
    },
    onClose: function() {
      disableScroll.off()
      OnboardingActions.hideOnboarding()
      return
    },
    onEnd: function() {
      disableScroll.off()
      OnboardingActions.hideOnboarding()
      return
    },
    onError: function() {
      disableScroll.off()
      OnboardingActions.hideOnboarding()
      return
    }
  }

  hopscotch.endTour(true)
  hopscotch.startTour(installerTour)
}

export default {
  start () {
    bootbox.dialog({
      title: 'Tutorial',
      message: "Which installation tutorial do you want to Start?",
      closeButton: true,
      buttons: {
        self_provided: {
          label: 'Self-Provided',
          className: 'btn-primary',
          callback () {
            showPlatformOnboarding('self-provided')
          }
        },
        linux: {
          label: 'Linux',
          className: 'btn-primary',
          callback () {
            showPlatformOnboarding('linux')
          }
        },
        windows: {
          label: 'Windows',
          className: 'btn-primary',
          callback () {
            showPlatformOnboarding('windows')
          }
        },
        docker: {
          label: 'Docker',
          className: 'btn-primary',
          callback () {
            showPlatformOnboarding('docker')
          }
        },
        aws: {
          label: 'AWS user-data',
          className: 'btn-primary',
          callback () {
            showPlatformOnboarding('aws')
          }
        }
      }
    })
  }
}
