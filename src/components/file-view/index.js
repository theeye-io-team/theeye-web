import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import isDataURI from 'validator/lib/isDataURI'
import isURL from 'validator/lib/isURL'

import CodeMirror from 'codemirror/lib/codemirror'
window.CodeMirror = CodeMirror

import 'codemirror/mode/meta'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/3024-night.css'
import 'codemirror/addon/display/fullscreen'
import 'codemirror/addon/display/fullscreen.css'

import './style.less'

const BodyView = View.extend({
  props: {
    title: 'string',
    file:  'object'
  },
  initialize () {
    // if (isURL(this.file)) {
    //   this.file = this.getBlobFromURL(this.file, this.title)
    // }
    
    console.log(this.file)

    View.prototype.initialize.apply(this, arguments)
  },
  getBlobFromURL (url, title) {
    let file;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/favicon.png");
    xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
    xhr.onload = () => {
      blob = xhr.response;//xhr.response is now a blob object
      return blob
    }
    xhr.send();
  },
  template: `<div>
    <div class="file-content" data-hook="file-content"></div>
    <a download class="button" data-hook="file-download">Download</a>
  </div>`,
  renderFile () {
    let el = this.queryByHook('file-content')
    let download = this.queryByHook('file-download')
    download.href = URL.createObjectURL(this.file)

    if (this.file.type.includes('image')) {
      el.innerHTML = `<img src=${URL.createObjectURL(this.file)} 
                      style="max-width: 80vw; max-height: 80vh;">`
    } else if (this.file.type.includes('text') || this.file.type.includes('application')) {
      let reader = new FileReader();

      let codemirror = CodeMirror(this.queryByHook('file-content'), {
        tabindex: 0,
        value: 'loading file...',
        lineNumbers: true,
        theme: '3024-night',
        tabSize: 2,
        smartIndent: true,
        readOnly: true,
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

      // FIXME: Not yet implemented
      // let info = codemirror.findModeByMIME(this.file.type)

      // autoLoadMode(codemirror, info.mode, () => {
      //   codemirror.setOption('mode', info.mime)
      // })

      reader.onload = () => {
        codemirror.setValue(reader.result)
        setTimeout(() => { codemirror.refresh() }, 500)
      }
    
      reader.readAsText(this.file)

    } else {
      el.innerHTML = `<div>Well this is awkward</div>`
    }
  },
  render () {
    this.renderWithTemplate(this)

    
    this.renderFile()
  },
  
})

const Modal = Modalizer.extend({
  props: {
    title: 'string',
    file:  'string'
  },
  dataURLtoBlob (dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n)
    while(n--){
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], {type:mime})
  },
  initialize () {
    const body = new BodyView({
      file: this.dataURLtoBlob(this.file), 
      title: this.title
    })
    this.bodyView = body
    this.buttons = false // disable built-in
    this.on('hidden', () => { this.remove() })
    Modalizer.prototype.initialize.apply(this, arguments)
  }
})

export default View.extend({
  props: {
    title: 'string',
    file:  'string'
  }, 
  template: `<button type="button" class="btn btn-primary" data-hook="button">Show file</button>`,
  events: {
    'click button': function (event) {
      const modal = new Modal({ title: this.title, file: this.file })

      modal.show()
    }
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
 