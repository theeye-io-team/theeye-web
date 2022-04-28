import View from "ampersand-view";
import Collection from "ampersand-collection";
import "./style.less"

export default View.extend({
  template: `
    <div class="selector">
      <div class="placeholder" data-hook="placeholder"></div>
      <div class="options-container">
        <div class="categories" data-hook="categories">
          <p class="option">Caca</p>
          <p class="option">Culo</p>
          <p class="option">Pedo</p>
          <p class="option">Pito</p>
          <p class="option">Pis</p> 
          <p class="option">Caca</p>
          <p class="option">Culo</p>
          <p class="option">Pedo</p>
          <p class="option">Pito</p>
          <p class="option">Pis</p> 
        </div>
        <div class="options" data-hook="options">
          
        </div>
      </div>
    </div>
  `,
  props: {
    options: ['object', true],
    placeholder: 'string',
    isOpen: ['boolean', true, false]
  },
  // derived: {
  //   collection: {
  //     deps: ['options'],
  //     fn () {
  //       return new Collection(this.options)
  //     }
  //   }
  // },
  bindings: {
    placeholder: {
      type: 'text'
    }
  }
})
