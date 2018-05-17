import ladda from 'ladda'
import View from 'ampersand-view'
import './styles.less'

module.exports = View.extend({
  template: `
    <li class="task-exec-button">
      <button data-hook="execute"
        class="ladda-button btn btn-primary tooltiped"
        title="Run this task"
        data-spinner-size="30"
        data-style="zoom-in">
        <i class="fa fa-play" aria-hidden="true"></i>
      </button>
    </li>
  `,
  events: {
    'click button[data-hook=execute]':'onClickExecute',
  },
  render () {
    this.renderWithTemplate()
    this.lbutton = ladda.create( this.queryByHook('execute') )
  },
})
