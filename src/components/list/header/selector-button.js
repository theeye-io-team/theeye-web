import BaseView from 'ampersand-view'

module.exports = BaseView.extend({
  template: `
    <button class="tableHeaderIconButton massChecker btn btn-primary simple-btn tooltiped" title="Select all" aria-label="Center Align">
      <span class="massiveSelector glyphicon glyphicon-unchecked"></span>
    </button>`,
  props: {
    title: 'string'
  },
  bindings: {
    title: {
      type: 'attribute',
      name: 'title'
    }
  }
})
