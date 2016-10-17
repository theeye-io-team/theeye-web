/**
 *
 * @author Facugon
 *
 */
var WorkflowPage = function(){

  var uri = URI(document.location);
  var query = uri.search(true);

  $.ajax({
    method:'get',
    url:'/api/workflow',
    data: query
  })
  .done(function(data){

    var elems = [];

    data.nodes.forEach( function(n) {
      elems.push({
        group: "nodes",
        data: {
          id: n.v,
          label: (n.value && n.value.name),
          value: n.value
        }
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
        center: true
      },
      style: [{
        selector: 'node',
        style: {
          'height': 50,
          'width': 50,
          'background-fit': 'cover',
          'border-color': '#000',
          'border-width': 3,
          'border-opacity': 0.5,
          'content': 'data(label)',
          'text-opacity': 0.8,
          'text-valign': 'center',
          'text-halign': 'right',
          'background-color': '#ee8e40',
          'background-image': function( ele ){
            var val = ele.data('value')||{ type: 'undefined' };

            function type () {
              var type = (val.type||val._type);
              return ( /event/i.test(type) ? 'event' : type ).toLowerCase();
            }

            return '/images/' + type() + '.png';
          },
        }
      }, {
        selector: 'edge',
        style: {
          'width': 4,
          'target-arrow-shape': 'triangle',
          'line-color': '#9dbaea',
          'target-arrow-color': '#9dbaea',
          'curve-style': 'bezier'
        }
      }]
    });

    cy.center();

  })
  .fail(function(xhr,status){
  });

}
