import View from 'ampersand-view'
import { EditorView } from './editor'

const FileModeConst = require('constants/file-input-mode')


const UploaderView = View.extend({
  template: `<div>Uploader</div>`,
  focus () { }
})

const UrlImportView = View.extend({
  template: `<div>URL</div>`,
  focus () { }
})

exports.Factory = function (mode, options) {
  let ModeView
  switch (mode) {
    case FileModeConst.EDITOR: 
      ModeView = EditorView
      break;
    case FileModeConst.UPLOAD:
      ModeView = UploaderView
      break;
    case FileModeConst.URL:
      ModeView = UrlImportView
      break;
  }
  return new ModeView(options)
}
