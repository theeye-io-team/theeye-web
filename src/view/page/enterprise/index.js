import View from 'ampersand-view'
import FormView from 'ampersand-form-view'
import InputView from 'ampersand-input-view'
import App from 'ampersand-app'
import { setEnterprise } from 'app/license'

export default View.extend({
  template: () => {
    let html = `
      <div class="login-container">
        <div class="container">
          <div class="login-main">
            <div data-hook="enterprise-form-container">
              <div class="row">
                <div class="col-xs-12">
                  <div class="title-wrapper">
                    <h1>Enterprise</h1>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-xs-12">
                  <div class="form-wrapper">
                    <div data-hook="enterprise-form" class="form-container"></div>
                    <button data-hook="start-enterprise">Next</button>
                  </div>
                </div>
              </div>
            </div>
            <div data-hook="login-form-container">
              <div class="row">
                <div class="col-xs-12">
                  <div class="title-wrapper">
                    <h1>Enterprise Sign In</h1>
                    <a href="" class="sign google desktop" data-hook="google-login"><i class="fa fa-google-plus"></i>Google+</a>
                    <a href="" class="sign google mobile" style="display:none;" data-hook="google-login-mobile"><i class="fa fa-google-plus"></i>Google+</a>
                    <h2 class="or"> - or - </h2>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-xs-12">
                  <div class="form-wrapper">
                    <div data-hook="login-form" class="form-container"></div>
                    <button data-hook="start-login">Sign in</button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <a href="/login"><h2 class="login-link">Back</h2></a>
            </div>
          </div>
        </div>
      </div>
    `
    return html
  },
  props: {
    formSwitch: ['boolean',false,true]
  },
  bindings: {
    formSwitch: [
      {
        type: 'toggle',
        hook: 'login-form-container',
        invert: true
      },
      {
        type: 'toggle',
        hook: 'enterprise-form-container'
      }
    ]
  },
  events: {
    'click [data-hook=google-login]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      App.actions.auth.loginProvider('google')
    },
    'click [data-hook=google-login-mobile]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      App.actions.auth.socialLoginMobile('googlemobile')
    },
    'click button[data-hook=start-login]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.loginForm.beforeSubmit()
      if (this.loginForm.valid) {
        var data = this.loginForm.data
        App.actions.auth.login(data)
      }
    },
    'click button[data-hook=start-enterprise]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      this.enterpriseForm.beforeSubmit()
      if (this.enterpriseForm.valid) {
        var data = this.enterpriseForm.data
        setEnterprise(data.organization)
      }
    }
  },
  initialize () {
    this.formSwitch = App.state.enterprise.showEnterpriseForm = true
    this.listenTo(App.state.enterprise, 'change:showEnterpriseForm', () => {
      this.toggle('formSwitch')
    })
  },
  render () {
    this.renderWithTemplate(this)

    this.loginForm = new LoginForm({})
    this.renderSubview(this.loginForm, this.queryByHook('login-form'))

    this.enterpriseForm = new EnterpriseForm({})
    this.renderSubview(this.enterpriseForm, this.queryByHook('enterprise-form'))
  }
})

const LoginForm = FormView.extend({
  initialize () {
    this.fields = [
      new InputView({
        placeholder: 'User or email',
        name: 'identifier',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        autofocus: true
      }),
      new InputView({
        type: 'password',
        placeholder: 'Password',
        name: 'password',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  }
})

const EnterpriseForm = FormView.extend({
  initialize () {
    this.fields = [
      new InputView({
        placeholder: 'Organization name',
        name: 'organization',
        required: true,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        autofocus: true,
        value: window.localStorage.enterpriseCustomer || ''
      })
    ]
    FormView.prototype.initialize.apply(this, arguments)
  }
})
