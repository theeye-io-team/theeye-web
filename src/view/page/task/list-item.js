'use strict'
import $ from 'jquery'
import ListItem from 'components/list/item'
import View from 'ampersand-view'
import EditButton from './buttons/edit'
import CopyButton from './buttons/copy'
import DeleteButton from './buttons/delete'
import assign from 'lodash/assign'
import ScheduleButton from './buttons/schedule'
import './style.css'
import bootbox from 'bootbox'
import { getSchedules, cancelSchedule } from 'actions/schedule'
import TaskConstants from 'constants/task'

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
  throw new Error(`unrecognized type ${model.type}`)
  //return new Item(options)
}

module.exports = Factory

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
  bindings: assign({},ListItem.prototype.bindings,{
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
    ])

    this.renderSubview(
      new Collapsed({ model: this.model }),
      this.queryByHook('collapsed-content')
    )

    const collapse = this.query('.itemRow > .collapse')
    $(collapse).on('show.bs.collapse', (event) => {
      getSchedules(this.model.id)
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
  },
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

const Collapsed = View.extend({
  template: `
    <div class="col-sm-12">
      <h4>Task Information</h4>
      <div class="row" data-hook="schedule-section"></div>
    </div>`,
  render: function () {
    this.renderWithTemplate(this)
    this.renderSubview(
      new ScheduleSection({model: this.model}),
      this.queryByHook('schedule-section')
    )
  }
})

const ScheduleSection = View.extend({
  template: `
    <div class="col-xs-12">
      <h4 style="border-bottom: 1px solid grey;">Schedules for this task</h4>
      <div class="scheduleHeader" style="color: #aaa;">
        <div class="col-sm-4"><h5>Initial date:</h5></div>
        <div class="col-sm-2"><h5>Repeats every:</h5></div>
        <div class="col-sm-4"><h5>Next iteration:</h5></div>
        <div class="col-sm-2"></div>
      </div>
      <div data-hook="schedule-list"></div>
    </div>`,
  bindings: {
    'model.hasSchedules': {
      type: 'toggle',
      selector: ''
    }
  },
  render: function () {
    this.renderWithTemplate(this)
    this.renderCollection(
      this.model.schedules,
      ScheduleRow,
      this.queryByHook('schedule-list'),
      {
        viewOptions: {
          task: this.model
        }
      }
    )
  }
})
const ScheduleRow = View.extend({
  props: {
    task: ['state', true]
  },
  template: `
    <div class="scheduleItem row">
      <div class="col-sm-4"><p data-hook="startDate"></p></div>
      <div class="col-sm-2"><p data-hook="repeatsEvery"></p></div>
      <div class="col-sm-4"><p data-hook="nextDate"></p></div>
      <div class="col-sm-2 text-right">
        <button type="button" class="btn btn-danger btn-sm deleteSchedule">
          Delete <span class="fa fa-trash"></span>
        </button>
      </div>
    </div>`,
  events: {
    'click button.deleteSchedule': 'deleteSchedule'
  },
  deleteSchedule: function (event) {
    bootbox.confirm(
      'The schedule will be canceled. Want to continue?',
      confirmed => {
        if (!confirmed) {
          return
        }
        cancelSchedule(this.task.id, this.model._id)
      }
    )
  },
  bindings: {
    'model.data.scheduleData.runDate': {
      hook: 'startDate',
      type: function(el, value, previousValue) {
        el.innerHTML = new Date(value).toString()
      }
    },
    'model.data.scheduleData.repeatEvery': {
      hook: 'repeatsEvery'
    },
    'model.nextRunAt': {
      hook: 'nextDate',
      type: function(el, value, previousValue) {
        el.innerHTML = new Date(value).toString()
      }
    }
  }
})
