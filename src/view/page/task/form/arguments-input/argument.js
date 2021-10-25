import View from 'ampersand-view'
import ArgumentForm from './form'
import Modalizer from 'components/modalizer'
import SelectView from 'ampersand-select-view'
import * as FIELD from 'constants/field'

import './style.less'

export default View.extend({
  template: `
    <li class="list-group-item">
      <div class="row" style="line-height: 30px;">
        <span class="col-xs-1" data-hook="order"></span>
        <span class="col-xs-2" data-hook="type"></span>
        <span class="col-xs-4" data-hook="label"></span>
        <input type="text" class="col-xs-3" data-hook="value" id="value" readonly>
        <span>
          <div class="fright" style="padding-right:8px;">
            <button class="btn btn-default btn-sm" data-hook="edit-script-argument">
              <i class="fa fa-edit"></i>
            </button>
            <button class="btn btn-default btn-sm" data-hook="remove-script-argument">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </span>
      </div>
    </li>
  `,
  bindings: {
    'model.order': { hook: 'order' },
    'model.label': { hook: 'label' },
    'model.type': [ { hook: 'type' }, {
      type: function (el, value) {
        if (value === FIELD.TYPE_FIXED) {
          el.required = true;
          el.removeAttribute('readonly')
        }
      },
      hook: 'value'
    }],
    'model.value': {
      type: function (el, value) {
        el.value = value;
      },
      hook: 'value'
    },
    'model.masked': {
      type: function (el, value) {
        if (value === true) {
          el.value = el.value.replace(/./g, '*')
        }
      },
      hook: 'value'
    }
  },
  events: {
    'click [data-hook=edit-script-argument]':'onClickEditScriptArgument',
    'click [data-hook=remove-script-argument]':'onClickRemoveScriptArgument',
    'click [data-hook=order]':'onClickOrder',
    'blur [data-hook=value]':'onDirectValueChange',
    'focus [data-hook=value]': 'unmaskValue'
  },
  onClickOrder (event) {
    event.preventDefault()
    event.stopPropagation()
    const container = this.queryByHook('order')

    if (container.querySelector('select') === null) {
      container.innerHTML = null
      const N = this.model.collection.length
      let orders = []
      for (let i=0;i<N;i++) {
        orders[i] = String(i)
      }

      let select = new SelectView({
        name: 'order',
        value: String(this.model.order),
        parent: this,
        options: orders,
        tabindex: 2,
      })

      this.renderSubview(select, container)
      select.query('select').style.backgroundColor = '#FFF'
      select.query('select').style.border = 'none'
      select.el.focus()
      const onSelectBlur = (event) => {
        select.el.removeEventListener('blur',onSelectBlur)
        select.remove()
        container.innerHTML = String(this.model.order)
      }
      select.el.addEventListener('blur',onSelectBlur,true)
    }

    return false
  },
  /**
   * @summary receive new order value from select view
   * @param {SelectView} orderSelect
   */
  update (orderSelect) {
    const order = Number(orderSelect.value)
    const currentOrder = this.model.order

    if (order===currentOrder) return

    // get the element with the selected order and swap
    let toSwap = this.model.collection.models.find(m => m.order === order)
    toSwap.order = currentOrder
    this.model.order = order
    this.model.collection.sort() // sort collection by new orders
  },
  onClickEditScriptArgument (event) {
    event.preventDefault()
    event.stopPropagation()

    const form = new ArgumentForm({ model: this.model })
    const modal = new Modalizer({
      buttons: false,
      title: 'Edit Argument',
      bodyView: form
    })

    this.listenTo(modal,'hidden',() => {
      form.remove()
      modal.remove()
    })

    this.listenTo(form,'submitted', () => {
      this.model.set( form.data )
      modal.hide()
    })

    modal.show()

    return false
  },
  onClickRemoveScriptArgument (event) {
    event.preventDefault()
    event.stopPropagation()
    this.model.collection.remove(this.model.id)
    return false
  },
  onDirectValueChange (event) {
    event.preventDefault()
    event.stopPropagation()
    if (this.model.type === FIELD.TYPE_FIXED) {
      this.model.set({ value: event.target.value })

      this.model.value === "" ?
        this.toggleWrong(true) :
        this.toggleWrong(false)
    }
    if (this.model.masked) {
      event.target.value = event.target.value.replace(/./g, '*')
    }
    return false
  },
  unmaskValue (event) {
    this.toggleWrong(false)
    if (this.model.masked) { event.target.value = this.model.value }
    return false
  },
  toggleWrong (isWrong) {
    if (isWrong === true) { 
      this.query("input[type=text]").classList.add("wrong")
    } else if (isWrong === false) {
      this.query("input[type=text]").classList.remove("wrong")
    } else { 
      this.query("input[type=text]").classList.toggle("wrong")
    }
  }
})
