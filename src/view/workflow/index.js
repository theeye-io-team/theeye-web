import App from 'ampersand-app'
import View from 'ampersand-view'
import qs from 'qs'
import './style.less'
import cytoscape from 'cytoscape'
import cydagre from 'cytoscape-dagre'
cydagre(cytoscape)
import { Images as IconsImages, Colors as IconsColors } from 'constants/icons'

export default View.extend({
  template: `
    <div class="workflow-component">
      <div class="workflow-container">
        <div class="workflow-graph-container" data-hook="graph-container"></div>
      </div>
    </div>
  `,
  props: {
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

    if (this.cy) {
      this.cy.destroy()
      this.cy = null
    }
    View.prototype.remove.apply(this, arguments)
  },
  updateCytoscape (redraw = false) {
    if (this.cy) {
      this.cy.destroy()
      this.cy = null
    }

    this.renderCytoscape()

    if (redraw === true) {
      this.recordNodesPositions()
    } else {
      // set stored nodes positions
      this.setNodesPositions()
    }

    this.cy.center()
    this.cy.fit()

    return this
  },
  renderCytoscape () {
    if (!this.graph) {
      return this
    }

    const elems = this.getCytoscapeElements()

    const cy = this.cy = cytoscape({
      container: this.queryByHook('graph-container'),
      elements: elems,
      boxSelectionEnabled: false,
      autounselectify: true,
      wheelSensitivity: 0.1,
      // initial zoom
      zoom: 1.1,
      minZoom: 0.5,
      maxZoom: 2.0,
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
            'height': 40,
            'width': 40,
            'background-fit': 'cover',
            'font-size': 12,
            'border-width': 2,
            'border-opacity': 1,
            'content': 'data(label)',
            'color': '#FFF',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-margin-y': -5,
            'background-color': '#ee8e40',
            //'border-color': function (ele) {
            //  /*
            //    This garbage code is here to work around a visual bug in which
            //    an ugly orange border would render around a node that should
            //    render without a border. What this code does is to pick a pre
            //    defined color to render a border that looks just like the image
            //    background, and is therefore unnoticeable
            //  */
            //  const dangerColor = "#d43f3a"
            //  const colors = {
            //    'event':        "#00CCCC",
            //    'script':       "#E50580",
            //    'scraper':      "#FF00CC",
            //    'approval':     "#22C000",
            //    'home':         "#FC7C00",
            //    'dummy':        "#FF6482",
            //    'notification': "#FFCC00",
            //    'process':      "#00AAFF",
            //    'webhook':      "#1E7EFB",
            //    'host':         "#FC7C00",
            //    'dstat':        "#00305B",
            //    'psaux':        "#000000" // This should never show up
            //  }
            //  const node = new Node(ele.data('value'))
            //  const color = colors[node.getFeatureType()] 
            //  return color || dangerColor
            //},
            //'background-image': function (ele) {
            //  var node = new Node(ele.data('value'))
            //  return node.getImgUrl()
            //}
            'border-color': function (ele) {
              const node = new Node(ele.data('value'))
              return IconsColors[node.getFeatureType()] 
            },
            'background-image': function (ele) {
              const node = new Node(ele.data('value'))
              return IconsImages[node.getFeatureType()]
            },
          }
        }, {
          selector: 'edge',
          style: {
            'width': 2,
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'text-rotation': 'autorotate',
            'text-margin-y': 10,
            'color': '#FFF',
            'line-color': '#FFF',
            'target-arrow-color': '#FFF',
            'font-size': 10,
            'content': function (ele) {
              return ele.data('label') || ''
            },
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

    cy.on('position', (e) => this.recordNodePosition(e))

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
  },
  setNodesPositions () {
    this.cy.nodes().forEach(node => {
      if (node.data('value').position) {
        node.position(node.data('value').position)
      }
    })
  },
  recordNodePosition (event) {
    const position = event.cyTarget.position()
    const nodeId = event.cyTarget.data('id')

    // update node data in graph
    const data = this.graph.node(nodeId)
    data.position = position
    this.graph.setNode(nodeId, data)
  },
  recordNodesPositions () {
    this.cy
      .nodes()
      .forEach(node => {
        const position = node.position()
        const nodeId = node.data('id')

        // update node data in graph
        const data = this.graph.node(nodeId)
        data.position = position
        this.graph.setNode(nodeId, data)
      })
  },
  setStartNode (targetNode) {
    if (this.graph.nodes().includes('START_NODE')) {
      this.graph.removeNode('START_NODE')
    }

    this.graph.setNode('START_NODE', {
      id: 'START_NODE',
      name: 'Start',
      type: 'home',
      _type: 'home'
    })

    this.graph.setEdge('START_NODE', targetNode)
  }
})

function Node (value) {
  value || (value = {})

  this.getFeatureType = function () {
    const type = (value.type || value._type).toLowerCase()
    const features = [
      'event', 'script', 'nodejs', 'scraper', 'approval',
      'home', 'dummy', 'notification', 'process',
      'webhook', 'host', 'dstat', 'psaux'
    ]

    const found = features.find(function (f) {
      const regexp = new RegExp(f, 'i')
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

  //this.getImgUrl = function () {
  //  const type = this.getFeatureType()
  //  return '/images/' + type + '.png'
  //}

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
