import App from 'ampersand-app'
import View from 'ampersand-view'
import qs from 'qs'
import './style.less'
import cytoscape from 'cytoscape'
import cydagre from 'cytoscape-dagre'
import edgehandles from 'cytoscape-edgehandles';

cydagre(cytoscape)
cytoscape.use( edgehandles )

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
    handles: ['object', false],
    connecting: ['boolean', true, false],
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
          selector: 'node.not-ghost',
          style: {
            'height': 40,
            'width': 40,
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
                'approval':     "#22C000",
                'home':         "#FC7C00",
                'dummy':        "#FF6482",
                'notification': "#FFCC00",
                'process':      "#00AAFF",
                'webhook':      "#1E7EFB",
                'host':         "#FC7C00",
                'dstat':        "#00305B",
                'psaux':        "#000000", // This should never show up
              }
              var node = new Node(ele.data('value'))
              return colors[node.getFeatureType()] 
            },
            'font-size': 12,
            'border-width': 2,
            'border-opacity': 1,
            'content': 'data(label)',
            'color': '#FFF',
            //'text-outline-width': 2,
            //'text-outline-color': '#111',
            //'text-opacity': 0.8,
            'text-valign': 'top',
            'text-halign': 'center',
            'text-margin-y': -5,
            'background-color': '#ee8e40',
            'background-image': function (ele) {
              var node = new Node(ele.data('value'))
              return node.getImgUrl()
            }
          }
        }, {
          selector: 'edge.not-ghost',
          style: {
            'width': 2,
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'text-rotation': 'autorotate',
            'text-margin-y': 10,
            'color': '#FFF',
            'line-color': '#FFF',
            'target-arrow-color': '#FFF',
            //'line-color': '#9dbaea',
            //'target-arrow-color': '#9dbaea',
            'font-size': 10,
            //'text-outline-width': 1,
            //'text-outline-color': '#111',
            //'text-opacity': 0.8,
            'content': function (ele) {
              return ele.data('label') || ''
            },
          }
        }, {
          selector: '.eh-ghost-edge, edge.eh-preview, edge.temp',
          style: {
            'width': 1,
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'color': '#FFF',
            'line-color': '#FFF',
            'target-arrow-color': '#FFF',
            'opacity': 0.5
          }
        }, {
          selector: '.eh-ghost-edge.eh-preview-active',
          style: {
            'opacity': 0
          }
        }, 
      ]
    })

    const defaults = {
      canConnect: function(sourceNode, targetNode){
        // whether an edge can be created between source and target
        return (targetNode.data('id') !== "START_NODE")
      },
      edgeParams: function( sourceNode, targetNode ){
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for edge
        
        return({
          group: 'edges',
          data: { source: sourceNode.data('id'), target: targetNode.data('id') },
          classes: ['temp']
        })
      },
      hoverDelay: 150, // time spent hovering over a target node before it is considered selected
      snap: true, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
      snapThreshold: 15, // the target node must be less than or equal to this many pixels away from the cursor/finger
      snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
      noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
      disableBrowserGestures: false // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
    };
    
    this.handles = cy.edgehandles( defaults );

    cy.on('tap', (event) => {
      const isNode = typeof event.target.isNode === 'function' && event.target.isNode() 
      const isEdge = typeof event.target.isEdge === 'function' && event.target.isEdge() 
      
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
    
    if (!redraw) {
      this.setPositions()
    }
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
        data: node.data,
        classes: ['not-ghost']
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
        })(e) },
        classes: ['not-ghost']
      })
    })

    return elems
  },
  recordPositions (event) {
    if (this.connecting) return 
    let data = this.graph.node(event.target.data('id'))
    data.position = event.target.position()
    this.graph.setNode(event.target.data('id'), data)
  },
  setPositions () {
    this.cy.nodes().forEach(node => {
      if (node.data('value').position) {
        node.position(node.data('value').position)
      }
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
  },
  createHandle (targetNode) {
    this.connecting = true
    this.handles.start(targetNode)
  },
  removeHandle () {
    this.handles.stop()
    this.connecting = false
  },
  removeTempEdge () {
    this.cy.elements('edge.temp')[0].remove()
  }
})

function Node (value) {
  value || (value = {})

  this.getFeatureType = function () {
    const type = (value.type || value._type).toLowerCase()
    const features = [
      'event', 'script', 'scraper', 'approval',
      'home', 'dummy', 'notification', 'process',
      'webhook', 'host', 'dstat', 's', 'psaux'
    ]

    const found = features.find(function (f) {
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
