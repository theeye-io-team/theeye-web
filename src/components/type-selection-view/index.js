import View from "ampersand-view";
import './style.less'

export default View.extend({
  props: {
    buttons: ['array', true, () => []],
    inline: ['boolean', false, false]
  },
  template: function () { return `
    <div ${!this.inline ? 'class="container"' : ''}>
      <div class="row buttons-container" data-hook="buttons-container"></div>
    </div>  
  `},
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
    id: ['string', true, 'placeholder'],
    description: ['string', true, 'Lorem Ipsum dolor sit amet'],
    callback: ['function', true, () => { return () => {} }],
    icon_class: ['string', true, 'fa-code'],
    color: ['string', true, '#c6639b']
  },
  template: function () { return `
    <div class="button-container col-lg-4 col-sm-6 col-xs-12">
      <button title="${this.name}" data-hook="${this.id}" class="btn button-view">
        <div class="icon" style="background-color: ${this.color};">
          <i class="fa ${this.icon_class}"></i>
        </div>
        <div class="text">
          <div class="name">${this.name}</div>
          <div class="description">${this.description}</div>
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
    this.callback(this.id)
  }
})