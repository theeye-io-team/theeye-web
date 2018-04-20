import App from 'ampersand-app'
import View from 'ampersand-view'
import cytoscape from 'cytoscape'
import cydagre from 'cytoscape-dagre'
import URI from 'urijs'

function Node( value ){
  value||(value={});

  this.getFeatureType = function(){
    var type = (value.type||value._type);
    var features = [
      'event','script','scraper','process',
      'webhook','host','dstat','psaux'
    ];

    var found = features.find(function(f){
      var regexp = new RegExp(f,'i');
      if( regexp.test( type ) ) return true;
    });

    return (found||'node');
  }

  this.getModelType = function(){
    var type = value._type;
    if( /event/i.test(type) ) return undefined;
    if( /task/i.test(type) ) return 'task';
    if( /monitor/i.test(type) ) return 'monitor';
    if( /webhook/i.test(type) ) return 'webhook';
    return undefined;
  }

  this.getImgUrl = function(){
    return '/images/' + ( this.getFeatureType() ) + '.png';
  }

  this.getResourceUrl = function(){
    var type = this.getModelType();
    if( !type ) return undefined;

    var search = { id: value.id };
    var uri = URI('/admin/' + type + '#search=' + value.name);
    uri.addSearch(search);
    return uri.toString();
  }

  Object.defineProperty(this,'data',{
    get: function(){
      var url = this.getResourceUrl();
      return {
        id: value.id,
        label: value.name,
        value: value,
        href: url
      }
    }
  });
}

module.exports = View.extend({
  props: {
    currentWorkflow: 'object',
  },
  template: require('./template.hbs'),
  initialize() {
    View.prototype.initialize.apply(this, arguments)
    this.listenToAndRun(App.state.workflowPage, 'change:currentWorkflow', () => {
      this.currentWorkflow = App.state.workflowPage.currentWorkflow
    })
  },
  render() {
    this.renderWithTemplate(this)
    this.on('change:currentWorkflow', () => {
      if(!this.currentWorkflow)
        return
      this.renderNodes()
    })
  },
  renderNodes() {
    var elems = [];

    this.currentWorkflow.nodes.forEach( function(n) {
      var node = new Node(n.value);
      elems.push({
        group: "nodes",
        data: node.data
      });
    });

    this.currentWorkflow.edges.forEach( function(e) {
      elems.push({
        group: "edges",
        data: { source: e.v , target: e.w }
      });
    });

    cydagre(cytoscape)

    var cy = window.cy = cytoscape({
      container: document.getElementById('workflow'),
      elements: elems,
      boxSelectionEnabled: false,
      autounselectify: true,
      layout: {
        fit:false,
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
          'color':'#FFF',
          'text-outline-width': 2,
          'text-outline-color': '#111',
          'text-opacity': 0.8,
          'text-valign': 'top',
          'text-halign': 'center',
          'background-color': '#ee8e40',
          'background-image': function( ele ){
            var node = new Node( ele.data('value') );
            return node.getImgUrl();
          },
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
    });

    cy.nodes().forEach(function(node){
      var type = node.data('value')._type
      if(/event/i.test(type) && !node.outgoers().length) {
        node.remove()
      }
    })

    cy.center();

    cy.on('tap','node',function(){
      var node = this;
      var href = node.data('href');
      if( ! href ) return;

      try { // your browser may block popups
        window.open( href, '_blank' );
      } catch(e) { // fall back on url change
        window.location.href = href;
      }
    });
  }
})
