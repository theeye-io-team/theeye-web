import View from "ampersand-view";
import './style.less'

export default View.extend({
  props: {
    buttons: ['array', true, () => []]
  },
  template: `
    <div data-component="catalogue">
      <div class="">
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
    name: ['string', true, 'placeholder'],
    description: ['string', true, 'Lorem Ipsum dolor sit amet'],
    hook: ['string', true, 'placeholder'],
    callback: ['function', true, () => { return () => {} }],
    icon_class: ['string', true, 'fa-code'],
    icon_color: ['string', true, '#ffffff0']
  },
  template () {
    return `
      <div class="button-container col-xxl-3 col-lg-4 col-sm-6 col-xs-12">
        <button data-hook="${this.hook}" class="btn button-view">
          <div class="icon" style="background-color: ${this.icon_color};">
            <i class="fa ${this.icon_class}"></i>
          </div>
          <div class="text">
            <div class="title">${this.name}</div>
            <div class="help">${this.description}</div>
          </div>
        </button>
      </div> 
    `
  },
  events: {
    click:'onclick' 
  },
  onclick(e) {
    e.stopPropagation()
    e.preventDefault()
    this.callback()
  }
})
