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
          content: "The task must have a name.",
          placement: "bottom",
          delay: 1000,
          onNext: function() {
            self.parent._fieldViews.name.input.value = 'HelloWorld Task'
          }
        },
        {
          target: self.parent._fieldViews.hosts.query('div.col-sm-9'),
          title: "Task Tutorial",
          content: "The host where the task runs must be selected.",
          placement: "top",
          yOffset: -5,
          xOffset: 15,
          onNext: function() {
            self.parent._fieldViews.hosts.setValue(self.parent._fieldViews.hosts.options.models[0].id)
          }
        },
        {
          target: self.parent.queryByHook('mode-button'),
          title: "Task Tutorial",
          content: 'Click on "Create Script" to go on with the tutorial.',
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
    hopscotch.startTour(taskTour4)
  }
}

export default TaskOnBoarding