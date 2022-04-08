import View from 'ampersand-view'
import ArgumentForm from './form'
import Modalizer from 'components/modalizer'
import SelectView from 'ampersand-select-view'
import * as FIELD from 'constants/field'

import './style.less'

export default View.extend({
  template: `
    <li data-component="argument-item" class="list-group-item">
      <div class="row" style="line-height: 30px;">
        <span class="col-xs-1">
          <span data-hook="order"></span>
        </span>
        <span class="col-xs-3" data-hook="type"></span>
        <span class="col-xs-3" data-hook="label"></span>
        <span class="col-xs-3">
          <input data-hook="value" name="value" type="text" readonly>
          <span data-hook="invalidity-message"></span>
        </span>
        <span class="col-xs-2">
          <div class="fright">
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
      type: function (el, masked) {
        if (masked === true) {
          el.value = el.value.replace(/./g, '*')
        }
      },
      hook: 'value'
    }
  },
  derived: {
    valid: {
      cache: false,
      fn () {
        if (this.model.type === FIELD.TYPE_FIXED) {
          return Boolean(this.value !== "")
        }
        return true
      }
    },
    value: {
      deps: ['model.value'],
      fn () {
        return this.model.value
      }
    }
  },
  events: {
    'click [data-hook=edit-script-argument]': 'onClickEditScriptArgument',
    'click [data-hook=remove-script-argument]': 'onClickRemoveScriptArgument',
    'click [data-hook=order]': 'onClickOrder',
    'blur [data-hook=value]': 'onDirectValueChanged',
    'focus [data-hook=value]': 'unmaskValue'
  },
  beforeSubmit () {
    this.toggleValidity(this.valid)
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
  onDirectValueChanged (event) {
    event.preventDefault()
    event.stopPropagation()

    if (this.model.type === FIELD.TYPE_FIXED) {
      this.model.set({ value: event.target.value })
      this.toggleValidity(this.valid)
    }

    if (this.model.masked) {
      event.target.value = event.target.value.replace(/./g, '*')
    }

    return false
  },
  unmaskValue (event) {
    this.toggleValidity(true)
    if (this.model.masked) {
      event.target.value = this.model.value
    }
    return false
  },
  toggleValidity (valid) {
    const input = this.query("input[type=text]")
    if (valid === false) { 
      input.classList.add("invalid")
      input.setAttribute('placeholder','complete the value here')
      input.nextElementSibling.classList.add('fa','fa-warning','text-danger')
    } else {
      input.classList.remove("invalid")
      input.nextElementSibling.classList.remove('fa','fa-warning','text-danger')
    }
  },
  initialize () {
    View.prototype.initialize.apply(this, arguments)

    this.on('change:valid', () => {
      this.toggleValidity(this.valid)
    })
  }
})
