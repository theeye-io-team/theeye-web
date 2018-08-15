import View from 'ampersand-view'
import bootbox from 'bootbox'
import DeleteButton from '../buttons/delete'
module.exports = DeleteButton.extend({
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
      var self = this
      this.deleteTask(this.form.model, function () {
        self.form.remove()
      })
    }
  }
})
