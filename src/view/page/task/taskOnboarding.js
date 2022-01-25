import App from 'ampersand-app'
import hopscotch from 'hopscotch'
import 'hopscotch/dist/css/hopscotch.min.css'

class TaskOnBoarding {
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
          content: "Click the script task icon.",
          placement: "right",
          delay: 500,
          showNextButton: false,
          showCTAButton: true,
          ctaLabel: 'Next',
          onCTA: function () {
            hopscotch.endTour(true)
            self.parent.launchScriptTaskForm()
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
          content: "The task must have a name.",
          placement: "bottom",
          delay: 1000,
          onNext: function() {
            self.parent._fieldViews.name.input.value = 'HelloWorld Task'
          }
        },
        {
          target: self.parent._fieldViews.host_id.query('div.col-sm-9'),
          title: "Task Tutorial",
          content: "The task must have a Bot to run.",
          placement: "top",
          yOffset: -5,
          xOffset: 15,
          onNext: function() {
            self.parent._fieldViews.host_id.setValue(self.parent._fieldViews.host_id.options.models[0].id)
          }
        },
        {
          target: self.parent.queryByHook('mode-button'),
          title: "Task Tutorial",
          content: 'Click on "Create Script" to add a script to this task.',
          placement: "top",
          showNextButton: false,
          showCTAButton: true,
          ctaLabel: 'Next',
          onCTA: function () {
            hopscotch.endTour(true)
            self.parent.scriptSelection.onClickModeButton()
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
    hopscotch.startTour(taskTour2)
  }

  step4() {
    var self = this
    var taskTour4 = {
      id: "taskTour4",
      i18n: {
        stepNums : ["10","11"]
      },
      steps: [
        {
          target: self.parent._fieldViews.script_runas.query('div.col-sm-9'),
          title: "Task Tutorial",
          content: "Set the script Run As | Interpreter",
          placement: "top",
          delay: 1000,
          onNext: function() {
            self.parent._fieldViews.script_runas.setValue(self.parent._fieldViews.script_runas.options.models[0].runner)
          }
        },
        {
          target: self.parent.queryByHook('confirm'),
          title: "Task Tutorial",
          content: "Click here to finish your task creation.",
          placement: "top",
          showNextButton: false,
          showCTAButton: true,
          ctaLabel: 'Done',
          onCTA: function () {
            hopscotch.endTour(true)
            self.parent.submit()
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

export default TaskOnBoarding
