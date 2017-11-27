import App from 'ampersand-app'
import BaseView from 'view/base-view'
module.exports = BaseView.extend({
  template: `
    <section class="dashboard-panel">
      <div data-hook="panel">
        <section class="stats-panel events-panel col-md-6">
          <h3>Stats</h3>
          <div data-hook="panel-container">
            <iframe style="width:100%;height:700px;"></iframe>
          </div>
        </section>
      </div>
    </section>
  `,
  render () {
    this.renderWithTemplate()
    const customer = App.state.session.customer
    var iframe = this.query('iframe')
    iframe.src = customer.config.kibana
  }
})
