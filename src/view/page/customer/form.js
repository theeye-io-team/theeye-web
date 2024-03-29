import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'
import TagsSelectView from 'view/tags-select'
import ConstantsView from 'view/constants'

import App from 'ampersand-app'

export default FormView.extend({
  initialize (options) {
    const isNew = this.model.isNew()

    this.fields = [
      new InputView({
        name: 'display_name',
        label: 'Display Name',
        value: this.model.display_name,
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        autofocus: true
      }),
      new InputView({
        name: 'description',
        label: 'Description',
        value: this.model.description,
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new InputView({
        name: 'logo',
        label: 'Logo URL',
        value: this.model.logo,
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
      }),
      new SelectView({
        label: 'HTTP Origins',
        name: 'http_origins',
        multiple: true,
        tags: true,
        allowCreateTags: true,
        value: this.model.http_origins,
        options: this.model.http_origins.map(el => {
          return { id: el, text: el }
        }),
        required: false,
        unselectedText: 'Allowed http origins',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new ConstantsView({
        outputFormat: 'array',
        name: 'tags',
        copyButton: false,
        exportButton: false,
        label: 'Tags',
        values: this.model.tags
      })
    ]

    if (isNew) {

      this.fields.push(
        new InputView({
          name: 'alias',
          label: 'Alias (unique)',
          value: this.model.alias,
          required: false,
          invalidClass: 'text-danger',
          validityClassSelector: '.control-label',
          pickable: true,
          pickerText: 'Alias will be auto assigned. Click to choose'
        })
      )
      this.fields.push(
        new InputView({
          name: 'name',
          label: 'Name',
          value: this.model.name,
          required: false,
          invalidClass: 'text-danger',
          validityClassSelector: '.control-label',
          pickable: true,
          pickerText: 'Name will be autogenerate. Click to choose'
        })
      )
    } else {
      this.fields.push(
        new InputView({
          name: 'alias',
          label: 'Alias (unique)',
          value: this.model.alias,
          required: true,
          invalidClass: 'text-danger',
          validityClassSelector: '.control-label'
        })
      )
    }


    FormView.prototype.initialize.apply(this, arguments)
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  }
})
