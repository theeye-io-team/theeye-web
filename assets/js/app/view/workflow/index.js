/**
 *
 * @author Facugon
 * @module WorkflowPage
 *
 */
var WorkflowPage = function(){

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



  var uri = URI(document.location);
  var query = uri.search(true);

  var req = $.ajax({
    method:'get',
    url:'/api/workflow',
    data: query
  })
  req.done(function(data){
    var elems = [];

    //data.nodes.forEach(d => console.log(d.value&&d.value._type) );

    data.nodes.forEach( function(n) {
      var node = new Node(n.value);
      elems.push({
        group: "nodes",
        data: node.data
      });
    });

    data.edges.forEach( function(e) {
      elems.push({
        group: "edges",
        data: { source: e.v , target: e.w }
      });
    });

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
  });
  req.fail(function(xhr,status){ });
}
