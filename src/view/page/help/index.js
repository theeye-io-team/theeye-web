import App from 'ampersand-app'
import View from 'ampersand-view'
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
        </div>
      </div>
    </div>
  `
})
