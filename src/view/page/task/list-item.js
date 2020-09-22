import App from 'ampersand-app'
import $ from 'jquery'
import ListItem from 'components/list/item'
import View from 'ampersand-view'
import EditButton from './buttons/edit'
import CopyButton from './buttons/copy'
import DeleteButton from './buttons/delete'
import ScheduleButton from 'view/buttons/schedule'
import ExportButton from './buttons/export'
import bootbox from 'bootbox'
import * as TaskConstants from 'constants/task'
import Schedules from './schedules'

function Factory (options) {
  const model = options.model
  if (model.type===TaskConstants.TYPE_SCRIPT) {
    return new ScriptItem(options)
  }
  if (model.type===TaskConstants.TYPE_SCRAPER) {
    return new ScraperItem(options)
  }
  if (model.type===TaskConstants.TYPE_APPROVAL) {
    return new ApprovalItem(options)
  }
  if (model.type===TaskConstants.TYPE_DUMMY) {
    return new DummyItem(options)
  }
  if (model.type===TaskConstants.TYPE_NOTIFICATION) {
    return new NotificationItem(options)
  }
  throw new Error(`unrecognized type ${model.type}`)
}

export default Factory

const Item = ListItem.extend({
  derived: {
    item_name: {
      deps: ['model.name'],
      fn () {
        return this.model.name
      }
    },
    item_description: {
      deps: ['model.type'],
      fn () {
        return this.model.type
      }
    },
    badge: {
      deps: ['model.hasTemplate'],
      fn () {
        if (this.model.hasTemplate) {
          return 'fa fa-clone remark-success visible-badge'
        }
      }
    },
    badge_tip: {
      deps: ['model.hasTemplate'],
      fn () {
        if (this.model.hasTemplate) {
          return 'This task is linked to a Template'
        }
      }
    }
  },
  bindings: Object.assign({}, ListItem.prototype.bindings, {
    badge: {
      hook: 'item_badge',
      type: 'attribute',
      name: 'class'
    },
    badge_tip: {
      hook: 'item_badge',
      type: 'attribute',
      name: 'title'
    },
  }),
  render () {
    ListItem.prototype.render.apply(this,arguments)

    this.addButtons([
      { view: ScheduleButton, params: { model: this.model } },
      { view: CopyButton, params: { model: this.model } },
      { view: EditButton, params: { model: this.model } },
      { view: DeleteButton, params: { model: this.model } },
      { view: ExportButton, params: { model: this.model } },
    ])

    this.renderSubview(
      new Collapsed({ model: this.model }),
      this.queryByHook('collapsed-content')
    )

    const collapse = this.query('.itemRow > .collapse')
    $(collapse).on('show.bs.collapse', (event) => {
      App.actions.scheduler.fetch(this.model)
    })
  }
})

const ScriptItem = Item.extend({
  derived: {
    item_description: {
      deps: ['model.script','model.hostname'],
      fn () {
        if (!this.model.script || !this.model.hostname) return ''

        let description = ''
        if (this.model.hostname) {
          description += `${this.model.hostname} `
        }
        if (this.model.script) {
          description += `> ${this.model.script.filename}`
        }

        return description
      }
    }
  }
})

const ScraperItem = Item.extend({
  derived: {
    item_description: {
      deps: ['model.hostname'],
      fn () {
        let description = ''
        if (this.model.hostname) {
          description += `${this.model.hostname} `
        }
        description += 'Web Request'
        return description
      }
    }
  },
})

const ApprovalItem = Item.extend({
  derived: {
    item_description: {
      deps: ['model.name'],
      fn () {
        return this.model.name
      }
    }
  }
})

const DummyItem = Item.extend({
  derived: {
    item_description: {
      deps: ['model.name'],
      fn () {
        return this.model.name
      }
    }
  }
})

const NotificationItem = Item.extend({
  derived: {
    item_description: {
      deps: ['model.name'],
      fn () {
        return this.model.name
      }
    }
  }
})

const Collapsed = View.extend({
  template: `
    <div class="col-sm-12">
      <h4>Task Information</h4>
      <div class="row" data-hook="schedule-section"></div>
    </div>`,
  render: function () {
    this.renderWithTemplate(this)
    this.renderSubview(
      new Schedules({model: this.model}),
      this.queryByHook('schedule-section')
    )
  }
})
