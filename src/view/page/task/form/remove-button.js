import View from 'ampersand-view'
import bootbox from 'bootbox'
import TaskActions from 'actions/task'
module.exports = View.extend({
  template: `
    <div class="form-group">
      <label class="col-sm-3 control-label" data-hook="label">Remove Task</label>
      <div class="col-sm-9">
        <div style="padding-bottom: 15px;">
          <button data-hook="build" title="remove the task" class="btn btn-danger">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  props: {
    form: 'state',
    onClick: ['any',true],
    name: ['string',false,'remove-button'],
    visible: ['boolean',false,false]
  },
  bindings: {
    visible: {
      type: 'toggle'
    }
  },
  session: {
    valid: ['boolean',false,true]
  },
  events: {
    'click button': function (event) {
      bootbox.confirm({
        title: 'Confirm Task removal',
        message: 'Remove the Task?',
        backdrop: true,
        buttons: {
          confirm: {
            label: 'Yes, please',
            className: 'btn-danger'
          },
          cancel: {
            label: 'I\m not sure',
            className: 'btn-default'
          }
        },
        callback: (confirmed) => {
          if (confirmed===true) {
            TaskActions.remove(this.form.model.id)
            this.form.remove()
          }
        }
      })
    }
  }
})

