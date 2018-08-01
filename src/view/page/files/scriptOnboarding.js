import App from 'ampersand-app'
import hopscotch from 'hopscotch'
import 'hopscotch/dist/css/hopscotch.min.css'

class ScriptOnBoarding {
  constructor(options) {
    this.parent = options.parent
  }

  render() {
  }

  remove() {
    if (hopscotch.getCurrTour() && hopscotch.getCurrTour().id !== 'taskTour4') {
      hopscotch.endTour(true)
    }
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
          content: "The script will be identified by the filename. You can see more examples in our <a href='https://github.com/theeye-io/theeye-docs/tree/master/scripts/examples' target='_blank'><b>docs</b></a>.",
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
          content: "Additional information is added for further description.",
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
          placement: "top",
          showNextButton: false,
          showCTAButton: true,
          ctaLabel: 'Next',
          onCTA: function () {
            hopscotch.endTour(true)
            self.parent.submitForm()
          }
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
}

export default ScriptOnBoarding
