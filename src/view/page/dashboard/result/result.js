import View from 'ampersand-view'

import IndicatorsPanel from './indicators'
import MonitorsPanel from './monitors'
import WorkflowsPanel from './workflows'

import './styles.less'

export default View.extend({
  template: `
    <div data-component="dashboard-page" class="admin-container dashboard">
      <div data-hook="indicators-panel"></div>
      <div data-hook="monitors-panel"></div>
      <div data-hook="workflows-panel"></div>
    </div>
  `,
  render () {
    this.renderWithTemplate()
    this.renderSubview(new IndicatorsPanel(), this.queryByHook('indicators-panel'))
    this.renderSubview(new MonitorsPanel(), this.queryByHook('monitors-panel'))
    this.renderSubview(new WorkflowsPanel(), this.queryByHook('workflows-panel'))
  }
})
