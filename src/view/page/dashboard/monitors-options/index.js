import App from 'ampersand-app'
import View from 'ampersand-view'
import DashboardActions from 'actions/dashboard'

module.exports = View.extend({
  template: require('./template.hbs'),
  props: {
    groupBy: 'object',
  },
  //derived: {
  //  groupingMonitorsByProp: {
  //    deps: ['groupBy'],
  //    fn () {
  //      return Boolean(this.groupBy.prop)
  //    }
  //  }
  //},
  //bindings: {
  //  groupingMonitorsByProp: {
  //    type: 'booleanClass',
  //    hook: 'show-more-options',
  //    yes: 'fa-toggle-on',
  //    no: 'fa-toggle-off'
  //  }
  //},
  initialize () {
    View.prototype.initialize.apply(this,arguments)

    this.groupBy = App.state.dashboard.monitorsGroupBy
  },
  events: {
    'click button':'showMoreOptions',
    'click li[data-hook=group-by]':'onClickGroupBy'
  },
  showMoreOptions (event) {
    //event.preventDefault()
    //event.stopPropagation()
    //return false
  },
  onClickGroupBy (event) {
    const item = event.target
    const prop = item.dataset.prop

    if (prop===this.groupBy.prop) return

    DashboardActions.setMonitorsGroupByProperty(prop)
  },
  render () {
    this.renderWithTemplate(this)

    this.listenToAndRun(this,'change:groupBy',() => {
      const prop = this.groupBy.prop
      if (!prop) {
        return
      } else {
        const propItemSelector = `li[data-prop=${prop}]`
        const item = this.query(propItemSelector)
        item.style.backgroundColor = '#ee8e40'
      }
    })

    $( this.query('button') ).tooltip({
      placement: 'left',
      trigger: 'hover'
    })
  }
})
