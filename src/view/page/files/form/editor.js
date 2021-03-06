import View from 'ampersand-view'
import Modalizer from 'components/modalizer'

import CodeMirror from 'codemirror/lib/codemirror'
window.CodeMirror = CodeMirror

import 'codemirror/mode/meta'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/3024-night.css'
import 'codemirror/addon/display/fullscreen'
import 'codemirror/addon/display/fullscreen.css'

export const EditorView = View.extend({
  props: {
    //file: 'state',
    //data: 'string',
    validMode: ['boolean', false, undefined]
  },
  template: `<div data-hook="editor-root"><div data-hook="editor-container"></div></div>`,
  render () {
    this.renderWithTemplate(this)
    const root = this.queryByHook('editor-root')
    const container = this.queryByHook('editor-container')

    this.codemirror = CodeMirror(container, {
      tabindex: 0,
      value: '',
      lineNumbers: true,
      theme: '3024-night',
      tabSize: 2,
      smartIndent: true,
      mode: 'shell',
      extraKeys: {
        "F11": function(cm) {
          if (!cm.getOption("fullScreen")) {
            cm.setOption("fullScreen", true)
            container.querySelector('.CodeMirror').style.height = '800px'
          } else {
            cm.setOption("fullScreen", false)
          }
          cm.focus()
        },
        "Esc": function(cm) {
          if (cm.getOption("fullScreen")) {
            cm.setOption("fullScreen", false)
            cm.focus()
          }
        }
      }
    })

    this.codemirror.on('optionChange', (instance, option) => {
      if (option === 'mode') {
        this.refresh()
      }
    })
  },
  setEditorContent (data) {
    if (data) {
      this.codemirror.setValue(data)
    }
    this.refresh()
  },
  clearEditorContent () {
    this.codemirror.setValue('')
    this.refresh()
  },
  setEditorMode (extension, next) {
    if (extension) {
      let info = CodeMirror.findModeByExtension(extension)
      this.validMode = Boolean(info)
      if (info) {
        autoLoadMode(this.codemirror, info.mode, () => {
          //this.file.mimetype = info.mime
          this.codemirror.setOption('mode', info.mime)
          next(null, info.mime)
        })
      } else {
        next(null, 'text/plain')
      }
    } else {
      next(null, 'text/plain')
    }
  },
  focus () {
    this.codemirror.focus()
  },
  refresh () {
    setTimeout(() => { this.codemirror.refresh() }, 500)
  }
})

/**
 *
 * https://github.com/codemirror/CodeMirror/issues/4838
 *
 * Most of the code from this file comes from:
 * https://github.com/codemirror/CodeMirror/blob/master/addon/mode/loadmode.js
 *
 */
const modeURL = '/js/codemirror/mode/%N/%N.js'
var loading = {}

const splitCallback = (cont, n) => {
  var countDown = n
  return function () {
    if (--countDown === 0) cont()
  }
}

const ensureDeps = (mode, cont) => {
  var deps = CodeMirror.modes[mode].dependencies
  if (!deps) return cont()
  var missing = []
  for (var i = 0; i < deps.length; ++i) {
    if (!CodeMirror.modes.hasOwnProperty(deps[i])) missing.push(deps[i])
  }
  if (!missing.length) return cont()
  var split = splitCallback(cont, missing.length)
  for (i = 0; i < missing.length; ++i) requireMode(missing[i], split)
}

const requireMode = (mode, cont) => {
  if (typeof mode !== 'string') mode = mode.name
  if (CodeMirror.modes.hasOwnProperty(mode)) return ensureDeps(mode, cont)
  if (loading.hasOwnProperty(mode)) return loading[mode].push(cont)

  var file = modeURL.replace(/%N/g, mode)
  var script = document.createElement('script')
  script.src = file
  var others = document.getElementsByTagName('script')[0]
  var list = loading[mode] = [cont]

  CodeMirror.on(script, 'load', function () {
    ensureDeps(mode, function () {
      for (var i = 0; i < list.length; ++i) list[i]()
    })
  })

  others.parentNode.insertBefore(script, others)
}

const autoLoadMode = (instance, mode, callback) => requireMode(mode, callback)
