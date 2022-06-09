import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import SelectView from 'components/select2-view'

export default Modalizer.extend({
  initialize (options) {
    this.title = 'Change assignees'
    this.buttons = true // disable built-in modal buttons
    Modalizer.prototype.initialize.apply(this, arguments)

    this.bodyView = new SelectView({
      label: "change ",
      multiple: true,
      options: [],
      required: true,
      unselectedText: 'Select observers',
      value: this.model.assignee
    })

    this.on('hidden', () => { this.remove() })

    this.listenToAndRun(this.model, 'change:observers', () => {
      this.bodyView.options = (() => { 
        let a = []
        this.model.observers.forEach(observer => {
          let b = {}
          b["id"] = observer["id"]
          b["text"] = observer["username"]
          a.push(b)
        })
        return a
      })()
    })

    this.listenTo(this,'confirm',function(){
      this.hide()
      App.actions.job.changeAssignee(this.model.id, this.bodyView.value)
    })
    App.actions.job.getParticipants(this.model.id)
  }
})
