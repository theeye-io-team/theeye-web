import View from 'ampersand-view'
import ExportDialog from './dialog'

export default View.extend({
  template: `
    <li>
      <button class="btn btn-primary" title="Export this task recipe" data-hook="export-recipe">
        <i class="fa fa-file-code-o dropdown-icon" aria-hidden="true"></i>
        <span>Export</span>
      </button>
    </li>
  `,
  events: {
    'click button':'onClickButton',
  },
  onClickButton (event) {
    event.stopPropagation()
    event.preventDefault()
    $('.dropdown.open .dropdown-toggle').dropdown('toggle')
    const dialog = new ExportDialog({ model: this.model })
    dialog.show()
    return false
  }
})

