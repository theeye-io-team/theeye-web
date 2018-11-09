import View from 'ampersand-view'
import isURL from 'validator/lib/isURL'
import './styles.less'

/**
 * Check if arg is either an array with at least 1 element, or a dict with at least 1 key
 * @return boolean
 */
function isCollapsable (arg) {
  return arg instanceof Object && Object.keys(arg).length > 0;
}

/**
 * Transform a json object into html representation
 * @return string
 */
function json2html (json) {
  var html = '';
  if (typeof json === 'string') {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (isURL(json))
      html += '<a href="' + json + '" class="json-string">' + json + '</a>';
    else
      html += '<span class="json-string">"' + json + '"</span>';
  }
  else if (typeof json === 'number') {
    html += '<span class="json-literal">' + json + '</span>';
  }
  else if (typeof json === 'boolean') {
    html += '<span class="json-literal">' + json + '</span>';
  }
  else if (json === null) {
    html += '<span class="json-literal">null</span>';
  }
  else if (json instanceof Array) {
    if (json.length > 0) {
      html += '[<ol class="json-array">';
      for (var i = 0; i < json.length; ++i) {
        html += '<li>'
        // Add toggle button if item is collapsable
        if (isCollapsable(json[i]))
          html += '<a href="#" data-hook="json-toggle" class="json-toggle"></a>';

        html += json2html(json[i]);
        // Add comma if item is not last
        if (i < json.length - 1)
          html += ',';
        html += '</li>';
      }
      html += '</ol>]';
    }
    else {
      html += '[]';
    }
  }
  else if (typeof json === 'object') {
    var key_count = Object.keys(json).length;
    if (key_count > 0) {
      html += '{<ul class="json-dict">';
      for (var i in json) {
        if (json.hasOwnProperty(i)) {
          html += '<li>';
          // Add toggle button if item is collapsable
          if (isCollapsable(json[i]))
            html += '<a href="#" data-hook="json-toggle" class="json-toggle">' + i + '</a>';
          else
            html += i;

          html += ': ' + json2html(json[i]);
          // Add comma if item is not last
          if (--key_count > 0)
            html += ',';
          html += '</li>';
        }
      }
      html += '</ul>}';
    }
    else {
      html += '{}';
    }
  }
  return html;
}

module.exports = View.extend({
  props: {
    json: ['any',true],
    collapsed: ['boolean',false,false]
  },
  template: `
    <div class="json-viewer-component" data-hook="container"></div>
  `,
  renderJson () {
    const container = this.queryByHook('container')
    const json = this.json

    var html = json2html(json)
    if (isCollapsable(json)) {
      html = '<a href="#" data-hook="json-toggle" class="json-toggle"></a>' + html
    }

    container.innerHTML = html
  },
  events: {
    'click a[data-hook=json-toggle]': (event) => {
      event.preventDefault()
      event.stopPropagation()

      let classList = event.target.nextElementSibling.classList
      if (classList.contains('hidden') === true) {
        event.target.nextElementSibling.classList.remove('hidden')
      } else {
        event.target.nextElementSibling.classList.add('hidden')
      }

      return false
    }
  },
  render () {
    this.renderWithTemplate()
    this.renderJson()
  }
})
