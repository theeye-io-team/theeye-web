import BaseView from 'view/base-view'

import 'select2'
import * as Select2Data from 'lib/select2data'

export default BaseView.extend({
  tagName: 'div',
  className: 'form-group form-horizontal',
  template () {
    let optional = this.optional ? '<small>[optional]</small>' : ''
    let html = `
      <div>
        <label for="users" class="col-sm-3 control-label">
          ${this.title} ${optional}
          <span style="cursor:help"
            title="Add permissions to specific users. Users will receive notifications"
            class="tooltiped fa fa-question">
          </span>
        </label>
        <div class="col-sm-9">
          <div>
            <select data-hook="${this.name}"
              class="form-control select"
              title="${this.title}"
              name="${this.name}"
              multiple
              style="width:100%">
              <option></option>
            </select>
          </div>
        </div>
        <span class="clear" style="clear: left;display: block;"></span>
      </div>
    `
    return html
  },
  initialize (options) {
    this.title = (options.title || 'ACL')
    this.name = (options.name || 'acl')
    this.optional = (options.optional || true)

    BaseView.prototype.initialize.apply(this, arguments)

    Object.defineProperty(this, 'values', {
      get: function () { return this.find('select').val() },
      set: function (values) {
        var select = this.find('select')
        select.val(values)
        select.trigger('change')
        return this
      }
    })
  },
  render () {
    this.renderWithTemplate()

    this.find('select').select2({
      placeholder: 'Users',
      data: Select2Data.PrepareIdValueData(
        this.collection.map(function (u) {
          return {
            text: u.attributes.email,
            id: u.attributes.email
          }
        }), {
          id: 'id',
          text: 'text'
        }
      ),
      tags: true
    })

    this.find('.tooltiped').tooltip()
  }
})
