import View from 'ampersand-view'
import cytoscape from 'cytoscape'
import cydagre from 'cytoscape-dagre'
import URI from 'urijs'
import './style.less'

module.exports = View.extend({
  template: `
    <div class="workflow-component">
      <button data-hook="fit">Fit</button>
      <button data-hook="center">Center</button>
      <button data-hook="redraw">Re-draw</button>
      <div class="workflow-graph-container" data-hook="graph-container"> </div>
    </div>
  `,
  props: {
    //graph: 'graphlib'
    graph: 'object' // Graph (graphlib) instance
  },
  events: {
    'click button[data-hook=fit]':'onClickFit',
    'click button[data-hook=center]':'onClickCenter',
    'click button[data-hook=redraw]':'onClickRedraw',
  },
  onClickFit (event) {
    event.preventDefault()
    event.stopPropagation()

    this.cy.fit()

    return false
  },
  onClickCenter (event) {
    event.preventDefault()
    event.stopPropagation()

    this.cy.center()

    return false
  },
  onClickRedraw (event) {
    event.preventDefault()
    event.stopPropagation()

    this.updateCytoscape()

    return false
  },
  render () {
    this.renderWithTemplate(this)
    this.renderCytoscape()

    this.on('change:graph', this.updateCytoscape, this) // force change event or replace graph object
  },
  getCytoscapeElements () {
    const elems = []
    const graph = this.graph

    graph.nodes().forEach(function (n) {
      var node = new Node(graph.node(n))
      elems.push({
        group: 'nodes',
        data: node.data
      })
    })

    graph.edges().forEach(function (e) {
      elems.push({
        group: 'edges',
        data: { source: e.v, target: e.w }
      })
    })
    return elems
  },
  updateCytoscape () {
    this.cy.destroy()
    this.renderCytoscape()
  },
  renderCytoscape () {
    const elems = this.getCytoscapeElements()
    cydagre(cytoscape)

    const cy = cytoscape({
      container: this.queryByHook('graph-container'),
      elements: elems,
      boxSelectionEnabled: false,
      autounselectify: true,
      layout: {
        fit: true,
        name: 'dagre',
        center: true,
        rankDir: 'LR'
      },
      style: [{
        selector: 'node',
        style: {
          'height': 50,
          'width': 50,
          'background-fit': 'cover',
          'border-color': '#FFF',
          'border-width': 1,
          'border-opacity': 1,
          'content': 'data(label)',
          'color': '#FFF',
          'text-outline-width': 2,
          'text-outline-color': '#111',
          'text-opacity': 0.8,
          'text-valign': 'top',
          'text-halign': 'center',
          'background-color': '#ee8e40',
          'background-image': function (ele) {
            var node = new Node(ele.data('value'))
            return node.getImgUrl()
          }
        }
      }, {
        selector: 'edge',
        style: {
          'width': 5,
          'target-arrow-shape': 'triangle',
          'line-color': '#9dbaea',
          'target-arrow-color': '#9dbaea',
          'curve-style': 'bezier'
        }
      }]
    })

    this.cy = cy
  }
})

function Node (value) {
  value || (value = {})

  this.getFeatureType = function () {
    var type = (value.type || value._type).toLowerCase()
    var features = [
      'event', 'script', 'scraper', 'process',
      'webhook', 'host', 'dstat', 'psaux'
    ]

    var found = features.find(function (f) {
      var regexp = new RegExp(f, 'i')
      if (regexp.test(type)) return true
    })

    return found
  }

  this.getModelType = function () {
    var type = value._type
    if (/event/i.test(type)) return undefined
    if (/task/i.test(type)) return 'task'
    if (/monitor/i.test(type)) return 'monitor'
    if (/webhook/i.test(type)) return 'webhook'
    return undefined
  }

  this.getImgUrl = function () {
    return '/images/' + (this.getFeatureType()) + '.png'
  }

  this.getResourceUrl = function () {
    var type = this.getModelType()
    if (!type) return undefined

    var search = { id: value.id }
    var uri = URI('/admin/' + type + '#search=' + value.name)
    uri.addSearch(search)
    return uri.toString()
  }

  Object.defineProperty(this, 'data', {
    get: function () {
      var url = this.getResourceUrl()
      return {
        id: value.id,
        label: value.name,
        value: value,
        href: url
      }
    }
  })
}