import FIELD from 'constants/field'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'
import HelpIcon from 'components/help-icon'

module.exports = FormView.extend({
  props: {
    fieldsDefinitions: 'array'
  },
  initialize (options) {
    const fieldsSpecs = options.fieldsDefinitions
    const fields = [ ]

    fieldsSpecs.forEach(spec => {
      //if (spec.type === FIELD.TYPE_FIXED) {
      //  fields.push(
      //    new InputView({
      //      readonly: true,
      //      label: spec.label,
      //      name: spec.label,
      //      required: spec.required,
      //      invalidClass: 'text-danger',
      //      validityClassSelector: '.control-label',
      //      value: spec.value
      //    })
      //  )
      //} else
      if (spec.type === FIELD.TYPE_INPUT) {
        fields.push(
          new InputView({
            label: spec.label,
            name: spec.label,
            required: spec.required,
            invalidClass: 'text-danger',
            validityClassSelector: '.control-label',
            value: spec.value
          })
        )
      } else if (spec.type === FIELD.TYPE_SELECT) {
        fields.push(
          new SelectView({
            label: spec.label,
            name: spec.label,
            multiple: false,
            tags: false,
            options: spec.options,
            value: spec.value,
            required: spec.required,
            idAttribute: 'id',
            textAttribute: 'label',
            //styles: 'form-group',
            unselectedText: `Select a ${spec.label}`,
            requiredMessage: 'Selection required',
            invalidClass: 'text-danger',
            validityClassSelector: '.control-label'
          })
        )
      }
    })

    this.fields = fields

    FormView.prototype.initialize.apply(this,arguments)
  },
  submit (next) {
    next || (next = function(){})

    this.beforeSubmit()
    if (this.valid) {
      next(null, this.data)
    }
  },
  focus () {
    const eles = this.queryAll('.form-control')
    if (eles.length==0) return
    eles[0].focus()
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
    this.renderHelpIcons()
  },
  renderHelpIcons () {
    this.fieldsDefinitions.forEach(def => {
      if (def.help) {
        const view = this._fieldViews[def.label]
        if (!view) return
        view.renderSubview(
          new HelpIcon({
            text: def.help
          }),
          view.query('label')
        )
      }
    })
  }
})