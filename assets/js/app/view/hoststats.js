var HostStats = function (io, specs) {

  var cachedStats = specs.cachedStats ;
  var agent = specs.agent ;
  var host = specs.host ;

  var $loadAvg1 = $(".loadAverage#lavg1");
  var $loadAvg5 = $(".loadAverage#lavg5");
  var $loadAvg15 = $(".loadAverage#lavg15");

  function log() {
    var deb = debug('eye:web:events');
    deb.apply(deb, arguments);
  }

  var Stats = {
    loadAverage: {},
    gauges: {},
    psaux: {
      filter: '',
      sort: {
        column: '',
        direction: 0
      }
    }
  };

  var Psaux = (function() {
    /** PS aux table */
    var $psauxTable = $("#psaux-table");
    var $psauxTbody = $("#psaux-table tbody");
    var $psauxSearchInput = $("#ps-search");

    return {
      update : function (data) {
        log('new psaux data');
        log(data);
        $psauxTable.data("data", data.stat);
        // Sort renderPsaux & filter
        Psaux.sort();
        Psaux.render($psauxTable.data("data"));
        Psaux.filterProcesses();
      },
      createControl : function () {
        // Click sobre el th[data-sort] ordena por esa columna
        $psauxTable.find("th[data-sort]").click(function() {
          var sortBy = $(this).data("sort");
          if (sortBy == Stats.psaux.sort.column) {
            Stats.psaux.sort.direction = Stats.psaux.sort.direction == 1 ? 0 : 1;
          }
          Stats.psaux.sort.column = sortBy;
          // reverse the order if sort is the current sort order
          Psaux.sort();
          Psaux.render($psauxTable.data("data"));
        });

        //something is entered in search form
        $psauxSearchInput.keyup(function() {
          var that = this;
          var inputText = $(that).val().toLowerCase().trim();

          Stats.psaux.filter = inputText;
          _.debounce(Psaux.filterProcesses, 500)();
        });
      },
      render : function (rows) {
        // Clear the  TBODY
        $psauxTbody.find("tr:not(.search-sf):not(.search-query-sf)").remove();
        var $rows = [];

        $rows = rows.map(function mapPsauxToRows(ps) {
          var $cols = [];
          var $tr = $("<tr></tr>");
          for (var col in ps) {
            var $td = $("<td></td>");
            $td.html(ps[col]);
            $cols.push($td);
          }
          $tr.append($cols);
          return $tr;
        });
        $psauxTbody.append($rows);
      },
      sort : function () {
        if (!Stats.psaux.sort.column) {
          return;
        }
        stat = _.sortByOrder($psauxTable.data("data"), [Stats.psaux.sort.column], [Stats.psaux.sort.direction]);
        $psauxTable.data("data", stat);
      },
      filterProcesses : function () {
        $psauxTable.find('.search-sf').remove();
        // affect all table rows on in systems table
        var tableRowsClass = $('.table-list-search tbody tr');
        tableRowsClass.each(function(i, val) {

          //Lower text for case insensitive
          var rowText = $(val).text().toLowerCase();
          if (Stats.psaux.filter != '') {
            $psauxTable.find('.search-query-sf').remove();
            $psauxTbody.prepend('<tr class="search-query-sf"><td colspan="6"><strong>Searching for: "' + Stats.psaux.filter + '"</strong></td></tr>');
          } else {
            $psauxTable.find('.search-query-sf').remove();
          }

          if (rowText.indexOf(Stats.psaux.filter) == -1) {
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
    }
  })();


  var Dstat = (function(){
    function updateGauges(dstat) {
      var memoryValue = (dstat.stat.mem_used * 100 / dstat.stat.mem_total);
      Stats.gauges.memoryConsumption.refresh(memoryValue.toFixed(2));

      var cpuValue = (100 - dstat.stat.cpu_idle);
      Stats.gauges.cpuConsumption.refresh(cpuValue.toFixed(2));

      var cacheValue = ((dstat.stat.cacheTotal - dstat.stat.cacheFree) * 100 / dstat.stat.cacheTotal);
      Stats.gauges.cacheConsumption.refresh(cacheValue.toFixed(2));

      //var diskValue = (dstat.stat.disk.total.usage.used * 100 / dstat.stat.disk.total.usage.total);
      //Stats.gauges.diskConsumption.refresh(diskValue.toFixed(2));
      var gauges = Stats.gauges.disks;
      var disks = dstat.stat.disk;
      _.each(disks,function(disk,index){ // object
        gauges.forEach(function(gauge){ // array
          if(gauge.name == index){
            var value = (disk.usage.used * 100 / disk.usage.total);
            gauge.elem.refresh(value.toFixed(2));
          }
        });
      });
    }

    function updateDiskUsage(disk) {
      var $diskusage = $("#diskusage");
      $diskusage.html("");
      Object.keys(disk).forEach(function(d) {
        if(d != 'total'){
          var $div = $("<div />");
          var name = d;
          var total = disk[d].usage.total;
          var usage = disk[d].usage.used / total * 100;
          var $title = $("<h3 />").html(name);
          var $bar = $("<div />").addClass("progress").css("width", "100%");
          var $barInner = $("<div />").addClass("progress-bar").css("width", usage + "%");
          $barInner.html(usage.toFixed(2) + "%");
          if (usage < 5) {
            $barInner.addClass("progress-bar-danger");
          } else if (usage < 25) {
            $barInner.addClass("progress-bar-warning");
          } else {
            $barInner.addClass("progress-bar-success");
          }
          $bar.append($barInner);
          $div.append($title);
          $div.append($bar);
          $diskusage.append($div);
        }
      });
    }

    function updateLoadAverage(dstat) {
      var lavg1 = dstat.stat.load_1_minute.toFixed(2);
      var lavg5 = dstat.stat.load_5_minute.toFixed(2);
      var lavg15 = dstat.stat.load_15_minute.toFixed(2);
      $loadAvg1.html(lavg1);
      $loadAvg5.html(lavg5);
      $loadAvg15.html(lavg15);
    }

    function createGauges() {
      if (Object.keys(Stats.gauges).length) {
        // Si los gauges ya está creados
        return;
      }
      Stats.gauges.memoryConsumption = new JustGage({
        id: "memoryconsumption",
        value: 0,
        min: 0,
        max: 100,
        title: "Memory Usage",
        label: "Percentage",
        titleFontColor: "#eee",
        valueFontColor : "#eee",
        labelFontColor : "#eee",

      });
      Stats.gauges.cpuConsumption = new JustGage({
        id: "cpuconsumption",
        value: 0,
        min: 0,
        max: 100,
        title: "CPU Usage",
        label: "Percentage",
        titleFontColor: "#eee",
        valueFontColor : "#eee",
        labelFontColor : "#eee",
      });
      Stats.gauges.cacheConsumption = new JustGage({
        id: "cacheconsumption",
        value: 0,
        min: 0,
        max: 100,
        title: "Swap Usage",
        label: "Percentage",
        titleFontColor: "#eee",
        valueFontColor : "#eee",
        labelFontColor : "#eee",
      });
    }

    function createDiskGauges(disks) {
      var $container = $("#gaugescontainer #disksconsumptioncontainer");
      var disksGauges = [];
      disks.forEach(function(disk){
        if( disk != 'total' ) {
          var id = "disk" + disk + "usage";
          $('<div class="col-sm-4"></div>').attr('id',id).appendTo($container);
          var gauge = new JustGage({
            id: id,
            value: 0,
            min: 0,
            max: 100,
            title: "Disk " + disk + " Usage",
            label: "Percentage",
            titleFontColor: "#eee",
            valueFontColor : "#eee",
            labelFontColor : "#eee",
          });
          disksGauges.push({
            name: disk,
            elem: gauge
          });
        }
      });
      Stats.gauges.disks = disksGauges;
    }

    return {
      update : function(dstat){
        log('new host-stats data');
        log(dstat);

        updateLoadAverage({ stat: dstat.stats });
        updateGauges({ stat: dstat.stats });
        updateDiskUsage( dstat.stats.disk );
      },
      initialize: function(options){
        createGauges();
        createDiskGauges(options.disks);
      }
    };
  })();

  (function HostState(){

    var template = Templates['assets/templates/host-stats.hbs'];
    var agentFailure = _.template('<span>Agent <span style="color:rgb(255, 255, 0);"><b>is failing.</b></span></span>');
    var agentSuccess = _.template('<span>Agent <span style="color:#5cb85c;"><b>is reporting.</b></span></span>');
    var agentStopped = _.template('<span>Agent <span style="color:rgb(255, 0, 0);"><b>is not reporting.</b></span></span>');
    var $container = $('[data-hook=host-container]');

    if( agent.state === 'normal' ) {
      var message = agentSuccess() ;
    } else if( agent.state === 'updates_stopped' ) {
      var message = agentStopped() ;
    } else {
      var message = agentFailure() ;
    }

    var last_update = moment( new Date(host.last_update) );
    var html = template({
      host: host,
      agentState: message,
      lastUpdateCalendar: last_update.calendar()
    });

    $container.html( html );

  })();


  function subscribeSocketNotifications(resource) {
    var host = window.location.pathname.split('/')[2];
    io.socket.post('/hoststats/subscribe/' + host, {
      resource: resource
    }, function serviceSocketSubscription(data, jwres) {
      log(data);
      log(jwres);
    });
  }

  function onSocketIoConnect() {
    log('socket connected');

    function initPsaux(){
      var psaux = _.findWhere(cachedStats, { type: "psaux" });
      if(!psaux) return;

      Psaux.createControl();
      Psaux.update({
        // Hago el map porque las properties llegan en diferente
        // orden desde sns y desde mongo local
        stat: psaux.stats.map(function mapMongoPsauxToEventPsAux(s) {
          return [
            s.user,
            s.pid,
            s["%cpu"],
            s["%mem"],
            s["vsz"],
            s["rss"],
            s["tty"],
            s["state"],
            s["started"],
            s["time"],
            s["command"]
          ]
        })
      });
      // subscribe psaux notifications
      io.socket.on("psaux_update", Psaux.update);
      subscribeSocketNotifications('psaux');
    }

    function initDstat(){
      var dstat = _.findWhere(cachedStats, { type: "dstat" });
      Dstat.initialize({ disks: Object.keys(dstat.stats.disk) });
      Dstat.update(dstat);

      // subscribe dstat notifications
      io.socket.on('host-stats_update', Dstat.update);
      subscribeSocketNotifications('host-stats');
    }

    initPsaux();
    initDstat();
  }

  log('listening sockets connection');
  if( io.socket.socket && io.socket.socket.connected ) onSocketIoConnect();
  io.socket.on("connect", onSocketIoConnect);

};
