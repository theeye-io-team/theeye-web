import App from 'ampersand-app'
import OnboardingActions from 'actions/onboarding'
import hopscotch from 'hopscotch'
import 'hopscotch/dist/css/hopscotch.min.css'

class OnBoarding {
  constructor(options) {
    this.parent = options.parent
  }

  render() {
  }

  remove() {
    if (hopscotch.getCurrTour()) {
      hopscotch.endTour(true)
    }
  }

  step1() {
    var self = this
    var taskTour1 = {
      id: "taskTour1",
      i18n: {
        stepNums : ["2"]
      },
      steps: [
        {
          target: self.parent.queryByHook('script'),
          title: "Task Tutorial",
          content: "Let's create a script based task.",
          placement: "right",
          delay: 500
        }
      ],
      showCloseButton: true,
      onEnd: function() {
        hopscotch.resetDefaultI18N()
        return
      },
      onClose: function() {
        hopscotch.resetDefaultI18N()
        return
      }
    }

    hopscotch.endTour(true)
    hopscotch.startTour(taskTour1)
  }

  step2() {
    var self = this
    var taskTour2 = {
      id: "taskTour2",
      i18n: {
        stepNums : ["3","4","5"]
      },
      steps: [
        {
          target: self.parent._fieldViews.name.input,
          title: "Task Tutorial",
          content: "Lets give our task a name.",
          placement: "bottom",
          delay: 1000,
          onNext: function() {
            self.parent._fieldViews.name.input.value = 'HelloWorld Task'
          }
        },
        {
          target: self.parent._fieldViews.hosts.query('div.col-sm-9'),
          title: "Task Tutorial",
          content: "Now lets select the host in which this task will be executed.",
          placement: "bottom",
          yOffset: -5,
          xOffset: 15,
          onNext: function() {
            self.parent._fieldViews.hosts.setValue(self.parent._fieldViews.hosts.options.models[0].id)
          }
        },
        {
          target: self.parent.queryByHook('mode-button'),
          title: "Task Tutorial",
          content: "Our script task needs a script to run. Lets create a new script.",
          placement: "top"
        }
      ],
      showCloseButton: true,
      onEnd: function() {
        hopscotch.resetDefaultI18N()
        return
      },
      onClose: function() {
        hopscotch.resetDefaultI18N()
        return
      }
    }

    hopscotch.endTour(true)
    hopscotch.startTour(taskTour2)
  }

  step3() {
    var self = this
    var taskTour3 = {
      id: "taskTour3",
      i18n: {
        stepNums : ["6","7","8","9"]
      },
      steps: [
        {
          target: self.parent._fieldViews.filename.input,
          title: "Script Tutorial",
          content: "Lets give our new <b>script</b> a name (don't forget it's extension). More exampleas available <a href='https://github.com/theeye-io/theeye-docs/tree/master/scripts/examples' target='_blank'>here</a>",
          placement: "bottom",
          delay: 1000,
          onNext: function() {
            self.parent._fieldViews.filename.input.value = 'helloWorld.sh'
            self.parent._fieldViews.filename.inputValue = 'helloWorld.sh'
          }
        },
        {
          target: self.parent._fieldViews.description.input,
          title: "Script Tutorial",
          content: "Add a description or any additional information here.",
          placement: "bottom",
          onNext: function() {
            self.parent._fieldViews.description.input.value = 'Auto generated example script.'
          }
        },
        {
          target: this.parent.exampleBtnView.el,
          title: "Script Tutorial",
          content: "Click here to load an example for the current filename extension.",
          placement: "right",
          yOffset: -10,
          onNext: function() {
            self.parent.exampleBtnView.onClickButton()
            var nextElem = self.parent.queryByHook('confirm')
            nextElem.scrollIntoView()
          }
        },
        {
          target: self.parent.queryByHook('confirm'),
          title: "Script Tutorial",
          content: "Click here to create your new script.",
          placement: "top"
        },
      ],
      showCloseButton: true,
      onEnd: function() {
        hopscotch.resetDefaultI18N()
        return
      },
      onClose: function() {
        hopscotch.resetDefaultI18N()
        return
      }
    }

    hopscotch.endTour(true)
    hopscotch.startTour(taskTour3)
  }

  step4() {
    var self = this
    var taskTour4 = {
      id: "taskTour4",
      i18n: {
        stepNums : ["10"]
      },
      steps: [
        {
          target: self.parent.queryByHook('confirm'),
          title: "Task Tutorial",
          content: "Click here to finish your task creation.",
          placement: "top",
          delay: 500,
          showNextButton: false,
          showCTAButton: true,
          ctaLabel: 'Done',
          onCTA: function() {
            OnboardingActions.updateOnboarding(true)
            hopscotch.endTour(true)
          }
        }
      ],
      showCloseButton: true,
      onEnd: function() {
        hopscotch.resetDefaultI18N()
        return
      },
      onClose: function() {
        hopscotch.resetDefaultI18N()
        return
      }
    }

    hopscotch.endTour(true)
    hopscotch.startTour(taskTour4)
  }
}

export default OnBoarding
