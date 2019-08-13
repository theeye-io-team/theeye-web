'use strict';

/**
 *
 * @author Facugon
 * @module StatsPage
 * @namespace Views 
 *
 */
function StatsPage () {
  var StatModel = Backbone.Model.extend({ });
  var StatCollection = Backbone.Collection.extend({ model: StatModel });

  function getState (id,next) {
    var host
    var stats
    var resource

    var done = lodash.after(3, function(){
      next(null,{
        host: host,
        stats: stats,
        resource: resource
      });
    });

    var host = new App.Models.Host({ id: id });
    host.fetch({
      success:function(){
        done();
      },
      failure:function(){
        next(new Error('host fetch error'));
      }
    });

    var resource = new App.Models.Monitor();
    resource.fetch({
      data: {
        where:{
          host_id: id,
          type: 'host',
          enable: true
        },
        limit: 1
      },
      success:function(){
        done();
      },
      failure:function(){
        next(new Error('host resource fetch error'));
      }
    });

    $.ajax({
      method:'get',
      url:'/api/host/' + id + '/stats',
      dataType:'json'
    }).done(function(data){
      stats = new StatCollection(data);
      done();
    }).fail(function(xhr,status){
      next(new Error(status));
    });
  }

  function log () {
    var deb = debug('eye:web:stats')
    deb.apply(deb, arguments)
  }

  var IpItemView = BaseView.extend({
    tagName: 'tr',
    template: [
      '<td data-hook="name"></td>',
      '<td data-hook="receive"></td>',
      '<td data-hook="send"></td>'
    ].join(''),
    render: function(){
      this.renderTemplate()

      this.queryByHook('name').html(this.model.get('name'))
      this.queryByHook('receive').html(this.model.get('receive'))
      this.queryByHook('send').html(this.model.get('send'))
    }
  })

  var IpsView = BaseView.extend({
    template: [
      '<table class="table">',
        '<thead>',
          '<tr>',
            '<th>Interface</th><th>Receive</th><th>Send</th>',
          '</tr>',
        '</thead>',
        '<tbody data-hook="items"></tbody>',
      '</table>'
    ].join(''),
    initialize:function(){
      BaseView.prototype.initialize.apply(this,arguments);
      this.listenTo(this.model,'change',this.render);
    },
    render: function () {
      this.renderTemplate()

      var net = this.model.get('stats').net
      var netArray = []
      for(var name in net){
        netArray.push({
          name: name,
          receive: net[name].receive,
          send: net[name].send
        })
      }

      this.renderCollection(
        new Backbone.Collection(netArray),
        IpItemView,
        this.queryByHook('items')[0]
      )
    }
  })

  var Psaux = function(options){
    var config = {
      filter: '',
      sort: {
        column: '',
        direction: 'asc'
      }
    };

    /** PS aux table */
    var $el = options.$el;
    var $psauxTable = $el.find('#psaux-table'),
      $psauxTbody = $el.find('#psaux-table tbody'),
      $psauxSearchInput = $el.find('#ps-search');

    function render (rows) {
      // Clear the  TBODY
      $psauxTbody.find('tr:not(.search-sf):not(.search-query-sf)').remove();
      var $rows = [];

      $rows = rows.map(function mapPsauxToRows(ps) {
        var $cols = [];
        var $tr = $('<tr></tr>');
        for (var col in ps) {
          var $td = $('<td></td>');
          $td.html(ps[col]);
          $cols.push($td);
        }
        $tr.append($cols);
        return $tr;
      });
      $psauxTbody.append($rows);
    };

    function processSort () {
      if (!config.sort.column) return;

      var data = $psauxTable.data('data');
      var sortedData = lodash.orderBy(
        data,
        [config.sort.column],
        [config.sort.direction]
      );
      $psauxTable.data('data',sortedData);
    };

    function filterProcesses () {
      $psauxTable.find('.search-sf').remove();
      // affect all table rows on in systems table
      var tableRowsClass = $('.table-list-search tbody tr');
      tableRowsClass.each(function(i, val) {

        //Lower text for case insensitive
        var rowText = $(val).text().toLowerCase();
        if (config.filter != '') {
          $psauxTable.find('.search-query-sf').remove();
          $psauxTbody.prepend('<tr class="search-query-sf"><td colspan="6"><strong>Searching for: "' + config.filter + '"</strong></td></tr>');
        } else {
          $psauxTable.find('.search-query-sf').remove();
        }

        if (rowText.indexOf(config.filter) == -1) {
          //hide rows
          tableRowsClass.eq(i).hide();

        } else {
          $psauxTable.find('.search-sf').remove();
          tableRowsClass.eq(i).show();
        }
      });

      //all tr elements are hidden
      if (tableRowsClass.children(':visible').length == 0) {
        $psauxTbody.append('<tr class="search-sf"><td class="text-muted" colspan="6">No entries found.</td></tr>');
      }
    }

    return {
      update: function (data) {
        log('new psaux data');
        log(data);
        $psauxTable.data('data', data.stat);
        // Sort renderPsaux & filter
        processSort();
        render($psauxTable.data('data'));
        filterProcesses();
      },
      createControl: function () {
        // Click sobre el th[data-sort] ordena por esa columna
        $psauxTable.find('th[data-sort]').click(function() {
          var orderBy = $(this).data('sort');
          if (orderBy == config.sort.column) {
            config.sort.direction = (config.sort.direction === 'desc') ? 'asc' : 'desc';
          }
          config.sort.column = orderBy;
          // reverse the order if sort is the current sort order
          processSort();
          render($psauxTable.data('data'));
        });

        //something is entered in search form
        $psauxSearchInput.keyup(function() {
          var that = this;
          var inputText = $(that).val().toLowerCase().trim();

          config.filter = inputText;
          _.debounce(filterProcesses, 500)();
        });
      }
    }
  };

  var LoadAverageView = BaseView.extend({
    initialize: function(){
      BaseView.prototype.initialize.apply(this,arguments);
      this.listenTo(this.model,'change',this.render);
    },
    render: function(){
      BaseView.prototype.render.apply(this,arguments);
      var stats = this.model.get('stats');

      var $load1 = this.queryByHook('load_average_1');
      $load1.html(parseFloat(stats.load_1_minute).toFixed(2));

      var $load5 = this.queryByHook('load_average_5');
      $load5.html(parseFloat(stats.load_5_minute).toFixed(2));

      var $load15 = this.queryByHook('load_average_15');
      $load15.html(parseFloat(stats.load_15_minute).toFixed(2));
    }
  });

  function getBlueToRed(percent){
    var b = percent < 50 ? 255 : Math.floor(255 - (percent * 2 - 100) * 255 / 100);
    var r = percent > 50 ? 255 : Math.floor((percent * 2) * 150 / 100);
    return 'rgb(' + r + ', 0, ' + b + ')';
  }

  var VerticalBarView = BaseView.extend({
    template: Templates['assets/templates/stats-page/progress-bar-vertical'],
    render: function(){
      this.renderTemplate();
      this.queryByHook('percent').css('height', this.percent + '%');
      this.queryByHook('percent').css('background', getBlueToRed(this.percent));
      this.queryByHook('percent_tag').html(this.percent_tag + '%');
      this.queryByHook('tag').html(this.tag);
    }
  });

  var StatGraphView = BaseView.extend({
    initialize: function(options){
      BaseView.prototype.initialize.apply(this,arguments);
      this.listenTo(this.model,'change',this.render);

      var self = this;
      window.onresize = function(event){
        self.progressBarWidth(event);
      }
    },
    // resize bars event
    progressBarWidth: function(event){
      var self = this,
        elems = this.find('.pull-left');

      elems.each(function(idx,bar){
        var value = self.$el.width()/elems.length;
        var m = value * 0.3;
        var w = Math.floor(value - m);

        var $bar = $(bar);

        var $progress = $bar.find('.progress-bar-vertical');
        $progress.width(w);
        $progress.css('margin','0 ' + Math.floor(m/2) + 'px');

        var $texts = $bar.find('span');
        if (w > 39) $texts.css('font-size','14px');
        else if (w > 20) $texts.css('font-size','12px');
        else $texts.css('font-size','11px');
      })
    },
    render: function(){
      BaseView.prototype.render.apply(this,arguments);
      var $container = this.$el;
      $container.empty();

      var self = this, cacheValue, cpuValue, memValue,
        cacheBar, cpuBar, memBar,
        stat = this.model.get('stats');

      cpuValue = parseInt(100 - stat.cpu_idle);
      memValue = parseInt(stat.mem_used * 100 / stat.mem_total);
      cacheValue = parseInt((stat.cacheTotal - stat.cacheFree) * 100 / stat.cacheTotal);

      cpuBar = new VerticalBarView({ percent: cpuValue, percent_tag: cpuValue, tag: 'CPU' });
      cpuBar.render();
      cpuBar.$el.appendTo($container);

      memBar = new VerticalBarView({ percent: memValue, percent_tag: memValue, tag: 'MEM' });
      memBar.render();
      memBar.$el.appendTo($container);

      cacheBar = new VerticalBarView({ percent: cacheValue, percent_tag: cacheValue, tag: 'CACHE' });
      cacheBar.render();
      cacheBar.$el.appendTo($container);

      _.each(stat.disk,function(disk,index){ // object
        if (index !== 'total') {
          var diskValue = parseInt(disk.usage.used * 100 / disk.usage.total);
          var diskBar = new VerticalBarView({
            percent: diskValue,
            percent_tag: diskValue,
            tag: index.toUpperCase()
          });
          diskBar.render();
          diskBar.$el.appendTo($container);
        }
      });

      this.progressBarWidth();
    }
  });

  var HostView = BaseView.extend({
    template: Templates['assets/templates/stats-page/host'],
    initialize: function(){
      BaseView.prototype.initialize.apply(this,arguments);

      this.listenTo(this.host,'change',this.onChange);
      this.listenTo(this.resource,'change',this.onChange);

      var _state_text = '';
      var _state_color = '';

      Object.defineProperty(this,'state',{
        set: function(state){
          switch(state){
            case 'updates_stopped':
              _state_text = 'has stopped reporting updates';
              _state_color = 'rgb(255,0,0)';
              break;
            case 'failure':
              _state_text = 'is failing';
              _state_color = 'rgb(255,255,0)';
              break;
            case 'normal':
              _state_text = 'is reporting';
              _state_color = 'rgb(0,255,0)';
              break;
            default:
              _state_text = 'state is unknown';
              _state_color = 'rgb(255,0,0)';
              break;
          }
          return this;
        },
      });

      Object.defineProperty(this,'state_text',{
        get: function(){ return _state_text; }
      });

      Object.defineProperty(this,'state_color',{
        get: function(){ return _state_color; }
      });

      this.state = this.resource.get('state');
    },
    onChange: function(){
      this.state = this.resource.get('state');
      this.render();
    }
  });

  var IndexView = BaseView.extend({
    template: Templates['assets/templates/stats-page/index'],
    initialize: function(options){
      BaseView.prototype.initialize.apply(this,arguments);
    },
    initPsauxView: function(){
      var stat = this.stats.find(function(stat){
        return stat.get('type') === 'psaux';
      });
      if (!stat) return;

      var psaux = new Psaux({ $el: this.queryByHook('processes-container') });
      psaux.createControl();
      psaux.update({
        // Hago el map porque las properties llegan en diferente
        // orden desde sns y desde mongo local
        stat: stat.get('stats').map(function (s) {
          return {
            'user'    : s.user,
            'pid'     : s.pid,
            '%cpu'    : s['%cpu'],
            '%mem'    : s['%mem'],
            'vsz'     : s['vsz'],
            'rss'     : s['rss'],
            'tty'     : s['tty'],
            'state'   : s['state'],
            'started' : s['started'],
            'time'    : s['time'],
            'command' : s['command']
          };
        })
      });

      onSocketConnected(function(){
        // connect and subscribe psaux notifications
        log('psaux listening socket updates');
        io.socket.on('psaux_update', psaux.update);
      })
    },
    initHostView:function(){
      this.hostView = new HostView({ host: this.host, resource: this.resource });
      this.hostView.render();
      this.hostView.$el.appendTo(this.queryByHook('host-container'));
    },
    initStatView: function(stat){
      var average = new LoadAverageView({
        el: this.queryByHook('stat-load-container')[0],
        model: stat
      })
      average.render()

      var statGraphView = new StatGraphView({ model: stat });
      statGraphView.$el.appendTo(this.queryByHook('stat-graph-container'))
      // append main container to the DOM
      statGraphView.render()
    },
    initIpsView:function(stat){
      this.ipsView = new IpsView({ model: stat })
      this.ipsView.render()
      this.ipsView.$el.appendTo(this.queryByHook('interfaces-container'))
    },
    render:function(){
      BaseView.prototype.render.apply(this,arguments)

      this.$el.appendTo( $('[data-hook=page-container]') )

      this.initPsauxView()
      this.initHostView()

      var stat = this.stats.find(function(stat){
        return stat.get('type') === 'dstat';
      })
      if (!stat) return;
      onSocketConnected(function(){
        log('listening stats updates')
        io.socket.on('host-stats_update',function(data){
          log('new stats data arrived')
          log(data)
          stat.set(data)
        })
      })

      this.initStatView(stat)
      this.initIpsView(stat)
    }
  })

  function onSocketConnected (onConnected) {
    if (!io.socket) return
    if (io.socket.socket && io.socket.socket.connected) {
      onConnected()
    }
    io.socket.on('connect',onConnected)
  }

  function subscribeSocketNotifications (resource) {
    var host = window.location.pathname.split('/')[2];
    io.socket.post('/hoststats/subscribe/' + host, {
      resource: resource
    }, function (data, jwres) {
      log(data);
      log(jwres);
    });
  }

  var Controller = function (){ }
  Controller.prototype = {
    index: function(){

      onSocketConnected(function(){
        subscribeSocketNotifications('psaux')
        subscribeSocketNotifications('host-stats')
      })

      var id = document.location.pathname.replace('/hoststats/','');
      getState(id,function(err,state){
        new IndexView(state).render();
      });
    }
  }

  var controller = new Controller();
  controller.index();
  return controller;
}
