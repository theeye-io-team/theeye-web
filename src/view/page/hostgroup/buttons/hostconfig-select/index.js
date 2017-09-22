import SelectView from 'components/select2-view'
import HostGroupActions from 'actions/hostgroup'
import extend from 'lodash/assign'
import ConfigsView from '../../configs'

module.exports = SelectView.extend({
  template: `
    <div class="form-group form-horizontal hostconfig-select">
      <label data-hook="label" class="col-sm-3 control-label"></label>
      <div class="col-sm-9">
        <select class="form-control select" style="width:100%"></select>
        <div data-hook="message-container" class="message message-below message-error">
          <p data-hook="message-text"></p>
        </div>
      </div>
        <section class="col-sm-12" data-hook="configs-container"> </section>
    </div>`,
  derived: {
    has_config: {
      deps: ['inputValue'],
      fn () {
        return Boolean(this.inputValue)
      }
    }
  },
  bindings: extend({},SelectView.prototype.bindings,{
    has_config: {
      type: 'toggle',
      hook: 'configs-container'
    },
  }),
  initialize () {
    SelectView.prototype.initialize.apply(this,arguments)

    this.on('change:value',() => {
      if (this.value) {
        HostGroupActions.fetchHostConfig(this.value)
      }
    },this)
  },
  render () {
    SelectView.prototype.render.apply(this,arguments)

    this.renderSubview(
      new ConfigsView({ edit_mode: true }),
      this.queryByHook('configs-container')
    )
  }
})
