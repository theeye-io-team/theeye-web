import App from 'ampersand-app'
import View from 'ampersand-view'
module.exports = View.extend({
  template: `
    <li>
      <button class="btn btn-primary" title="Export this task recipe" data-hook="export-recipe">
        <i class="fa fa-file-code-o dropdown-icon" aria-hidden="true"></i>
        <span>Export recipe</span>
      </button>
    </li>
  `,
  events: {
    'click button':'onClickButton',
  },
  onClickButton (event) {
    event.stopPropagation()
    event.preventDefault()
    //$('.dropdown.open .dropdown-toggle').dropdown('toggle')
    App.actions.task.exportRecipe(this.model.id)
    return false
  }
})
