import App from 'ampersand-app'
import View from 'ampersand-view'
import XHR from 'lib/xhr'
import './style.less'

export default View.extend({
  template: `
    <div class="help-page admin-container">
      <div class="admin-panel">
        <h3 class="list-title"">Help</h3>
        <div data-hook="help-container" class="help-container">
          <h4>Need some help?</h4>
          <p>Visit our website: <a class="help-link" target="_blank" href="https://theeye.io/">theeye.io</a></p>
          <p>Our documentation: <a class="help-link" target="_blank" href="https://documentation.theeye.io">documentation.theeye.io</a></p>
          <h4>Versions</h4>
          <p class="version">TheEye Web <small data-hook="web-ver">fetching version</small></p>
          <p class="version">TheEye Supervisor <small data-hook="sup-ver">fetching version</small></p>
          <p class="version">TheEye Gateway <small data-hook="gate-ver">fetching version</small></p>

        </div>
      </div>
    </div>
  `,
  render() {
    this.renderWithTemplate(this)
    
    XHR.send({
      url: `${App.config.api_url}/status`,
      method: 'GET',
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response,xhr) => {
        console.log(response)
        this.queryByHook("gate-ver").innerHTML = response.theeye_version
      },
      fail: (err,xhr) => {
        this.queryByHook("gate-ver").innerHTML = 'unknown version'
        App.state.alerts.danger('sorry', 'failed to do that')
      }
    })

    XHR.send({
      url: `${App.config.supervisor_api_url}/api/status`,
      method: 'GET',
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done: (response,xhr) => {
        console.log(response)
        this.queryByHook("sup-ver").innerHTML = response.theeye_version
      },
      fail: (err,xhr) => {
        this.queryByHook("sup-ver").innerHTML = 'unknown version'
        App.state.alerts.danger('sorry', 'failed to do that')
      }
    })

    this.queryByHook("web-ver").innerHTML = process.env.__VERSION__ || 'unknown version'
  }
})
