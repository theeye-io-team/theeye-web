import View from 'ampersand-view'
import App from 'ampersand-app'

export default View.extend({
  template: `
    <div>
      <h3 class="blue bold">MEMBERS</h3>
      <div class="row">
        <div class="message container">
          <p>The <b>MEMBERS</b> tab has been renamed to <b>Users</b>, and it's been moved to the new <b>IAM</b> tab</p>
          <button class="btn btn-primary">Check it out!</button>
        </div>
      </div>
    </div>
  `,
  events: {
    'click button': () => {
      App.actions.settingsMenu.hide('customer')
      App.actions.iamMenu.toggleTab('users')
      App.navigate('/admin/iam')
      //App.actions.iamMenu.show()
    }
  }
})
