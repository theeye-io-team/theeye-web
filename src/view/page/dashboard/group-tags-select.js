import BaseView from 'view/base-view'
import 'select2'
import jquery from 'jquery'

/**
 *
 * selection element for grouping of monitors
 *
 */
const ApplyGroupButton = BaseView.extend({
  template: `
    <button style="position:absolute;top:0;right:0;"
      class="btn btn-default"
      title="apply grouping">
      <span class="fa fa-check"></span>
    </button>
  `,
  events: {
    'click button': function (event) {
      this.trigger('click');
    }
  },
  render () {
    this.renderWithTemplate(this)
    jquery( this.query('button') ).tooltip()
  }
})

export default BaseView.extend({
  props: {
    selected: 'array',
    options: 'array'
  },
  template:`<select name="tags" class="tags" style="width:100%;" multiple></select>`,
  initialize (options) {
    BaseView.prototype.initialize.apply(this,arguments)

    this.confirmButton = new ApplyGroupButton()
    this.listenTo(this.confirmButton, 'click', this.applyGrouping)
    this.changed = false
  },
  applyGrouping:function(){
    var tags = this.find('select').val();
    var uri = URI();
    uri.removeSearch(/.*/);

    if (Array.isArray(tags) && tags.length!==0) {
      tags.forEach(function(tag){
        uri.addQuery('tags',tag);
      });
    }

    window.location = uri.toString();
  },
  events:{
    'change select':'onChangeSelect'
  },
  onChangeSelect (event) {
    if (!this.changed) {
      this.changed = true
      this.renderSubview(
        this.confirmButton,
        this.query('.select2.select2-container')
      )
    }
  },
  render () {
    this.renderWithTemplate(this)

    var data = this.options.map(function(m){
      return {
        id: m.get('name'),
        text: m.get('name')
      }
    });

    var $select = jquery( this.query('select') )

    // set initial values
    if (Array.isArray(this.selected) && this.selected!==0) {
      this.selected.forEach((item) => {
        $select.append(`<option value="${item}" selected>${item}</option>`)
      })
    }

    $select.select2({
      tabindex: 0,
      //tags: true,
      multiple: true,
      placeholder: 'Grouping Tags',
      data: data
    })
  }
})
