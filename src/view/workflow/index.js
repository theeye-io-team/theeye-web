import App from 'ampersand-app'
import View from 'ampersand-view'
import qs from 'qs'
import './style.less'
import cytoscape from 'cytoscape'
import cydagre from 'cytoscape-dagre'
cydagre(cytoscape)

export default View.extend({
  template: `
    <div class="workflow-component">
      <div class="workflow-buttons">
        <button class="btn btn-default" data-hook="fit">Fit</button>
        <button class="btn btn-default" data-hook="center">Center</button>
        <button class="btn btn-default" data-hook="redraw">Re-draw</button>
        <button class="btn action-required" data-hook="warning-indicator" disabled>
          <i class="fa fa-warning"></i>
        </button>
      </div>
      <div class="workflow-container">
        <div class="workflow-graph-container" data-hook="graph-container"> </div>
      </div>
    </div>
  `,
  props: {
    warningToggle: ['boolean', false, false],
    clearBtn: ['boolean', false, false],
    cy: ['object', false],
    graph: 'object' // Graph (graphlib) instance
  },
  initialize () {
    View.prototype.initialize.apply(this,arguments)

    const state = App.state.workflowVisualizer
    const updateState = () => {
      state.graph = this.graph
      state.cy = this.cy
    }

    this.listenToAndRun(this, 'change:graph', updateState)
    this.listenToAndRun(this, 'change:cy', updateState)
  },
  remove () {
    const state = App.state.workflowVisualizer
    state.graph = null
    state.cy = null
  },
  bindings: {
    warningToggle: [
      {
        type: 'booleanClass',
        name: 'btn-danger',
        hook: 'warning-indicator'
      }, {
        type: 'booleanAttribute',
        name: 'disabled',
        hook: 'warning-indicator',
        invert: true
      }
    ],
    clearBtn: {
      type: 'toggle',
      hook: 'clear'
    }
  },
  events: {
    'click button[data-hook=fit]':'onClickFit',
    'click button[data-hook=center]':'onClickCenter',
    'click button[data-hook=redraw]':'onClickRedraw',
    'click button[data-hook=clear]':'onClickClear',
    'click button[data-hook=warning-indicator]':'onClickWarningIndicator',
  },
  onClickWarningIndicator (event) {
    event.preventDefault()
    event.stopPropagation()

    this.trigger('click:warning-indicator')

    return false
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
  onClickClear (event) {
    event.preventDefault()
    event.stopPropagation()

    this.trigger('click:clear')

    return false
  },
  updateCytoscape () {
    if (this.cy) {
      this.cy.destroy()
      this.cy = null
    }

    this.renderCytoscape()

    this.cy.center()
    this.cy.fit()

    return this
  },
  renderCytoscape () {
    if (!this.graph) {
      return this
    }
    const elems = this.getCytoscapeElements()

    const cy = cytoscape({
      container: this.queryByHook('graph-container'),
      elements: elems,
      boxSelectionEnabled: false,
      autounselectify: true,
      wheelSensitivity: 0.1,
      // initial zoom
      zoom: 1.1,
      minZoom: 0.5,
      maxZoom: 1.1,
      layout: {
        fit: false,
        name: 'dagre',
        //rankDir: 'TB'
        rankDir: 'LR'
      },
      style: [
        {
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
            'curve-style': 'bezier',
            'content': function (ele) {
              return ele.data('label') || ''
            },
            'text-rotation': 'autorotate',
            'text-margin-y': -10,
            'color': '#FFF',
            'font-size': 15,
            'text-outline-width': 1,
            'text-outline-color': '#111',
            'text-opacity': 0.8,
          }
        }
      ]
    })

    cy.on('tap', (event) => {
      const isNode = typeof event.cyTarget.isNode === 'function' && event.cyTarget.isNode() 
      const isEdge = typeof event.cyTarget.isEdge === 'function' && event.cyTarget.isEdge() 
      
      if (isNode) {
        this.trigger('tap:node', event)
      } else if (isEdge) {
        this.trigger('tap:edge', event)
      } else {
        this.trigger('tap:back', event)
      }
    })

    this.cy = cy

    return this
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

    let labels = Object.assign({}, graph._edgeLabels)

    graph.edges().forEach(function (e) {
      elems.push({
        group: 'edges',
        data: { source: e.v, target: e.w, label: ((e) => {
          const key = Object.keys(labels).filter(
            key => key.includes(e.v) && key.includes(e.w)
          )[0]
          const label = labels[key]
          delete labels[key]
          return label
        })(e) }
      })
    })

    return elems
  }
})

function Node (value) {
  value || (value = {})

  this.getFeatureType = function () {
    var type = (value.type || value._type).toLowerCase()
    var features = [
      'event', 'script', 'scraper', 'approval', 'dummy', 'notification', 'process',
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

    search = qs.stringify(search, { addQueryPrefix: true })

    var uri = '/admin/' + type + search + '#search=' + value.name

    return uri
  }

  this.getResourceLabel = function () {
    var type = this.getModelType()
    if (!type) return

    if (type === 'task') {
      var task = App.state.tasks.get(value.id)
      if (!task) return
      return task.name
    }
  }

  Object.defineProperty(this, 'data', {
    get: function () {
      var url = this.getResourceUrl()
      var label = this.getResourceLabel() || value.name
      return {
        id: value.id,
        label: label,
        value: value,
        href: url
      }
    }
  })
}
