'use strict'

import JsonViewer from 'components/json-viewer'
import Modalizer from 'components/modalizer'

//import CommandOutputViewer from 'components/command-output-viewer'

/**
 *
 * @summary modal to display jobs output
 *
 */
module.exports = Modalizer.extend({
  props: {
    output: 'any'
  },
  initialize (options) {
    Modalizer.prototype.initialize.apply(this, arguments)

    this.backdrop = false
    this.title = 'Execution Output'

    this.bodyView = new JsonViewer({ json: this.output })

    this.listenTo(this, 'hidden', () => {
      this.bodyView.remove()
      delete this.bodyView
    })

    this.listenTo(this, 'change:output', () => {
      if (!this.output) { return }
      this.bodyView.json = this.output
      this.bodyView.render()
    })
  }
})
