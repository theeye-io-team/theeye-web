import App from 'ampersand-app'
import View from 'ampersand-view'
import './styles.less'

module.exports = View.extend({
  template: `
    <div data-component="group-options" class="dropdown panel-item icons">
      <button class="dropdown-toggle btn btn-primary"
        title="group options"
        type="button"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="true">
        <i data-hook="show-more-options" class="fa fa-ellipsis-v" aria-hidden="true"></i>
      </button>
      <ul class="dropdown-menu dropdown-menu-right">
        <div>
          <li><button data-hook="group-by" data-prop="hostname" class="btn btn-primary">Bot</button></li>
          <li><button data-hook="group-by" data-prop="type" class="btn btn-primary">Type</button></li>
          <li><button data-hook="group-by" data-prop="name" class="btn btn-primary">Name</button></li>
          <li role="separator" class="divider"></li>
          <li><button data-hook="group-by" data-prop class="btn btn-primary">Ungroup</button></li>
        </div>
      </ul>
    </div>
  `,
  props: {
    groupBy: 'object',
  },
  initialize () {
    View.prototype.initialize.apply(this,arguments)
    this.groupBy = App.state.dashboard.tasksGroupBy
  },
  events: {
    'click button':'showMoreOptions',
    'click li button[data-hook=group-by]':'onClickGroupBy'
  },
  showMoreOptions (event) {
    //event.preventDefault()
    //event.stopPropagation()
    //return false
  },
  onClickGroupBy (event) {
    const item = event.target
    const prop = item.dataset.prop

    if (prop===this.groupBy.prop) { return }

    App.actions.dashboard.setTasksGroupByProperty(prop)
  },
  render () {
    this.renderWithTemplate(this)

    this.listenToAndRun(this,'change:groupBy',() => {
      const prop = this.groupBy.prop
      if (!prop) {
        return
      } else {
        const propItemSelector = `li button[data-prop=${prop}]`
        const item = this.query(propItemSelector)
        item.style.backgroundColor = '#23324C'
      }
    })

    $( this.query('button') ).tooltip({
      placement: 'left',
      trigger: 'hover'
    })
  }
})
