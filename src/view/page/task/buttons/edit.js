import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import bootbox from 'bootbox'
import $ from 'jquery'

export default PanelButton.extend({
  initialize (options) {
    this.title = `Edit`
    this.iconClass = 'fa fa-edit dropdown-icon'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()
      $('.dropdown.open .dropdown-toggle').dropdown('toggle')

      return import(/* webpackChunkName: "task-form" */ '../form')
        .then(({ default: FormView}) => {
          this.model.fetch({
            success: () => {
              const form = new FormView({ model: this.model })

              const { name, id } = this.model
              const modal = new Modalizer({
                buttons: false,
                title: `Edit task ${name} [${id}]`,
                bodyView: form
              })

              this.listenTo(modal,'shown',() => { form.focus() })

              this.listenTo(modal,'hidden',() => {
                form.remove()
                modal.remove()
              })

              this.listenTo(form,'submitted',() => {
                modal.hide()
              })

              modal.show()

              if (this.model.hasTemplate) {
                bootbox.alert({
                  title: 'Warning',
                  message: `
                    <div>
                      <p>Warning!</p>
                      <p>You are customizing a task that belongs to a template, changes will be only applied to this task.</p>
                      <p>Please update your template to make changes available for all.</p>
                    </div>
                  `
                })
              }
            },
            error: () => {
              bootbox.alert({
                title: 'Connection Error',
                message: `<div>An error ocurred. Please if the problem persist contact support</div>`
              })
            }
          })
        })
    }
  }
})
