import View from "ampersand-view";
import './style.less'

export default View.extend({
  props: {
    buttons: ['array', true, () => []]
  },
  template: `
    <div data-component="catalogue">
      <div class="container">
        <div class="row buttons-container" data-hook="buttons-container"></div>
      </div>  
    </div>
  `,
  render () {
    this.renderWithTemplate(this)

    this.buttons.forEach(button => {
      this.renderSubview(
        new ButtonView({...button}),
        this.queryByHook('buttons-container')
      )
    });
  }
})

const ButtonView = View.extend({
  props: {
    title: ['string', true, 'placeholder'],
    hook: ['string', true, 'placeholder'],
    help: ['string', true, 'Lorem Ipsum dolor sit amet'],
    callback: ['function', true, () => { return () => {} }],
    icon_class: ['string', true, 'fa-code'],
    color: ['string', true, '#c6639b']
  },
  template: function () {
    return `
    <div class="button-container col-xxl-3 col-lg-4 col-sm-6 col-xs-12">
      <button data-hook="${this.hook}" class="btn button-view">
        <div class="icon" style="background-color: ${this.color};">
          <i class="fa ${this.icon_class}"></i>
        </div>
        <div class="text">
          <div class="title">${this.title}</div>
          <div class="help">${this.help}</div>
        </div>
      </button>
    </div> 
  ` },
  events: {
    click:'onclick' 
  },
  onclick(e) {
    e.stopPropagation()
    e.preventDefault()
    this.callback()
  }
})
