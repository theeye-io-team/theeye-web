import TaskCollapsibleRow from '../collapsible-row'
import TaskConstants from 'constants/task'
import TaskRowView from '../task'

let taskIcons = {
  script: 'fa fa-code',
  scraper: 'fa fa-cloud',
  approval: 'fa fa-thumbs-o-up',
  notification: 'fa fa-bell-o',
  dummy: 'fa fa-list-ul'
}

module.exports = TaskCollapsibleRow.extend({
  derived: {
    hostname: {
      deps: [],
      fn: () => ''
    },
    type: {
      fn: () => TaskConstants.TYPE_GROUP
    },
    type_icon: {
      deps: ['model.groupby','model.name'],
      fn () {
        switch (this.model.groupby) {
          case 'type':
            let type = this.model.name.toLowerCase()
            return taskIcons[type]
            break;
          case 'name':
            let name = this.model
              .name
              .toLowerCase()
              .replace(/[^a-z ]/g,'')
              .trim()

            return 'fa fa-letter fa-letter-' + name[0]
            break;
          case 'hostname':
            return 'fa theeye-robot-solid'
            break;
          default:
            break;
        }
      }
    },
    header_type_icon: {
      deps: ['model.groupby','model.name'],
      fn () {
        let type
        switch (this.model.groupby) {
          case 'type':
            type = this.model.name.toLowerCase()
            return `circle ${taskIcons[type]} ${type}-color`
            break;
          case 'name':
            let name = this.model
              .name
              .toLowerCase()
              .replace(/[^a-z ]/g,'')
              .trim()

            return 'circle group-color fa fa-letter fa-letter-' + name[0]
            break;
          case 'hostname':
            return 'circle fa theeye-robot-solid bot-color'
            break;
          default:
            break;
        }
      }
    }
  },
  renderCollapsedContent () {
    this.taskRows = this.renderCollection(
      this.model.submodels,
      TaskRowView,
      this.queryByHook('collapse-container-body')
    )
  },
  renderButtons () {
    this.el.querySelector('.panel-item.icons.dropdown').remove()
  }
})
