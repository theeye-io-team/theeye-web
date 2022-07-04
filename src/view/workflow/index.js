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
      <div class="workflow-container">
        <div class="workflow-graph-container" data-hook="graph-container"></div>
      </div>
    </div>
  `,
  props: {
    clearBtn: ['boolean', false, false],
    cy: ['object', false],
    graph: 'object', // Graph (graphlib) instance
    start_task_id: 'string',
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

    this.renderCytoscape(redraw)

    this.cy.center()
    this.cy.fit()

    return this
  },
  renderCytoscape (redraw) {
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
            'height': 50,
            'width': 50,
            'background-fit': 'cover',
            'border-color': function (ele) {
              /*
                This garbage code is here to work around a visual bug in which
                an ugly orange border would render around a node that should
                render without a border. What this code does is to pick a pre
                defined color to render a border that looks just like the image
                background, and is therefore unnoticeable
              */
              const colors = {
                'event':        "#00CCCC",
                'script':       "#E50580",
                'scraper':      "#FF00CC",
                'approval':     "#2200CC",
                'dummy':        "#FF6482",
                'notification': "#FFCC00",
                'process':      "#00AAFF",
                'webhook':      "#1E7EFB",
                'host':         "#FC7C00",
                'dstat':        "#00305B",
                'psaux':        "#000000" // This should never show up
              }
              var node = new Node(ele.data('value'))
              return colors[node.getFeatureType()] 
            },
            'border-width': 3,
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
            'width': 3,
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
    cy.on('position', (e) => this.recordPositions(e))

    this.cy = cy
    
    if (!redraw) this.setPositions()
    // TODO: Record default positions

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
  recordPositions(event) {
    let data = this.graph.node(event.cyTarget.data('id'))
    data.position = event.cyTarget.position()
    this.graph.setNode(event.cyTarget.data('id'), data)
  },
  setPositions () {
    this.cy.nodes().forEach(node => {
      if (node.data('value').position) {
        node.position(node.data('value').position)
      }
    })
  },
  setStartNode (start_task_id) {
    if(this.graph.nodes().includes('START_NODE')) {
      this.graph.removeNode('START_NODE')
    }
    // TODO: Create the assets for the starting node @facugon
    this.graph.setNode('START_NODE', {
      start_task_id,
      id: 'START_NODE',
      name: 'Execution',
      type: 'dummy',
      _type: 'dummy'
    })
    this.graph.setEdge('START_NODE', start_task_id, 'Begin')
    this.start_task_id = start_task_id
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
