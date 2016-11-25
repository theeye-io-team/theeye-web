'use strict';

/**
 *
 * @author Facugon
 * @module DashboardPage
 * @namespace Components
 *
 */

//var jQuery = require('jquery');
//var Modal = require('../modal');
//var BaseView = require('../base-view');
//var Templates = require('templates'); // global object
//var Backbone = require('backbone');
//var App = require('../../app'); // this one does not exist
//var Select2 = require('select2');
//var Select2Data = require('../../lib/select2data');

function DashboardPage () {
  var stateIcons = {
    normal: "icon-check",
    failure: "icon-warn",
    updates_stopped: "icon-error",
    unknown: "icon-nonsense"
  }

  var classToState = {
    "icon-check": "normal",
    "icon-warn": "failure",
    "icon-error": "updates_stopped",
    "icon-nonsense": "unknown"
  };

  /**
   *
   * view to fold items using a hidden container.
   * folded items are moved from it's base container to this one.
   * to unfold slide the container to show/hide content
   *
   * this is a custom view to attach events to the elements.
   *
   */
  var ItemsFolding = function (el) {
    var $el = $(el);
    var $items = $el.find('[data-hook=hidden-items]');
    var $button = $el.find('[data-hook=toggle-hidden-items]');
    var $icon = $button.find('span');

    this.$container = $el.find('[data-hook=hidden-items-container]');

    function toggle () {
      $items.slideToggle();
      $icon.toggleClass('glyphicon-menu-down glyphicon-menu-up');
    }

    $button.on('click',toggle);
    this.toggle = toggle;

    this.fold = function(){
      $items.slideUp();
      if ($icon.hasClass('glyphicon-menu-up')) {
        $icon
          .removeClass('glyphicon-menu-up')
          .addClass('glyphicon-menu-down');
      }
    };

    this.unfold = function(){
      $items.slideDown();
      if ($icon.hasClass('glyphicon-menu-down')) {
        $icon
          .removeClass('glyphicon-menu-down')
          .addClass('glyphicon-menu-up');
      }
    };

    this.hideButton = function(){
      $button.hide();
    }

    this.showButton = function(){
      $button.show();
    }
  }

  /**
   *
   * Backbone Views
   *
   *
   * add custome panels on the fly.
   * by default there are two panels, one for monitors and the other for tasks previuosly created and redered in the template.
   * with this , we can add another one
   *
   */
  var PanelView = BaseView.extend({
    tagName:'section',
    className:'dashboard-panel',
    template:Templates['assets/templates/dashboard/panel.hbs'],
    title:'no title',
    name:'noname'
  });

  /**
   *
   * table row items for the collapsed content of the monitor rows.
   *
   */
  var SubmonitorView = BaseView.extend({
    tagName:'tr',
    className:'submonitoRow',
    template:Templates['assets/templates/dashboard/submonitor-row.hbs'],
    events:{
      'click [data-hook=last_event]':'onClickLastEvent'
    },
    onClickLastEvent:function(event){
      event.preventDefault();
      event.stopPropagation();

      new LastEventView({ model: this.model });

      return false;
    },
    initialize:function(){
      this.stateIcon = stateIcons[this.model.get('state')];
      this.listenTo(this.model,'change:state',this.updateStateIcon);
    },
    updateStateIcon:function(){
      this.stateIcon = stateIcons[this.model.get('state')];
      this.queryByHook('state-icon')[0].className = this.stateIcon;
    },
  });

  /**
   *
   * extend submonitors view , change the table format and data.
   *
   */
  var SubmonitorGroupView = SubmonitorView.extend({
    template:Templates['assets/templates/dashboard/submonitor-group-row.hbs'],
  });

  /**
   *
   * modal to display last event reported by the monitor
   *
   */
  var LastEventView = BaseView.extend({
    autoRender: true,
    template: Templates['assets/templates/dashboard/monitor-last-event.hbs'],
    render: function(){
      var self = this;
      BaseView.prototype.render.apply(this, arguments);
      this
        .queryByHook('container')
        .jsonViewer( this.model.get('last_event') );

      var modal = new Modal({
        backdrop: false,
        save_button: false,
        'title': 'Last Event'
      });
      modal.render();
      modal.content = this;
      modal.$el.on('hidden.bs.modal',function(){
        modal.remove();
        self.remove();
      });
      modal.show();
    }
  });

  /**
   *
   * single monitor row view.
   * trigger events when the monitor state changes
   *
   */
  var MonitorView = BaseView.extend({
    template: Templates['assets/templates/dashboard/monitor-row.hbs'],
    className:'monitorRow',
    events:{
      'click button[data-hook=search]':'onClickSearch',
      'click button[data-hook=workflow]':'onClickWorkflow',
      'click button[data-hook=stats]':'onClickStats',
      'click button[data-hook=edit]':'onClickEdit',
    },
    onClickSearch:function(event){
      event.stopPropagation();
      event.preventDefault();

      var $search = $('.js-searchable-box');
      $search.find('input').val( this.model.get('name') );
      $search.find('button.search').trigger('click');

      return false;
    },
    onClickWorkflow:function(event){
      event.stopPropagation();
      event.preventDefault();

      window.location = '/admin/workflow?node=' + this.model.get('monitor').id ;

      return false;
    },
    onClickStats:function(event){
      event.stopPropagation();
      event.preventDefault();

      window.location = "/hoststats/" + this.model.get('host_id');

      return false;
    },
    onClickEdit:function(event){
      event.stopPropagation();
      event.preventDefault();

      window.location = "/admin/monitor#search=" + this.model.attributes.id;

      return false;
    },
    initialize:function(){
      this.listenTo(this.model.get('submonitors'),'change',this.updateStateIcon);
    },
    updateStateIcon:function(){
      var highState = this.model
        .get('submonitors').reduce(function(highState,monitor){
          var state = monitor.get('state');
          if (!highState) return state;
          var p1=monitorStatePriority[state],
            p2=monitorStatePriority[highState];
          return (p1>p2) ? state : highState;
        },null);

      this.stateIcon = stateIcons[highState];
      this.state = highState;
      this.queryByHook('state-icon')[0].className = this.stateIcon;

      this.trigger('change:stateIcon',this);
    },
    render:function(){
      BaseView.prototype.render.apply(this, arguments);
      this.renderCollection(
        this.model.get('submonitors'),
        SubmonitorView,
        this.queryByHook('submonitors-container')[0]
      );
      this.updateStateIcon();
    }
  });

  /**
   * monitors grouped rows. this works when grouping is applied only
   */
  var MonitorsGroupView = MonitorView.extend({
    render:function(){
      BaseView.prototype.render.apply(this, arguments);

      // change collapsed content table headers
      var columns =
        '<th></th>' + 
        '<th>Name</th>' +
        '<th>Hostname</th>' +
        '<th>Type</th>' +
        '<th>Last Update</th>' +
        '<th></th>' ;

      this.queryByHook('title-cols').html(columns);
      this.queryByHook('collapse-container').find('h4').remove();
      this.queryByHook('monitor-icons-block').remove();

      this.renderCollection(
        this.model.get('submonitors'),
        SubmonitorGroupView,
        this.queryByHook('submonitors-container')[0]
      );
      this.updateStateIcon();
    }
  });

  /**
   * tasks rows
   */
  var TaskView = BaseView.extend({
    className:'taskRow',
    template: Templates['assets/templates/dashboard/task-row.hbs'],
    events:{
      'click button[data-hook=workflow]':'onClickWorkflow',
      'click button[data-hook=edit]':'onClickEdit',
    },
    onClickWorkflow:function(event){
      event.stopPropagation();
      event.preventDefault();

      window.location = '/admin/workflow?node=' + this.model.attributes.id ;

      return false;
    },
    onClickEdit:function(event){
      event.stopPropagation();
      event.preventDefault();

      window.location = "/admin/task#search=" + this.model.attributes.id;

      return false;
    },
  });

  /**
   *
   * selection element for grouping of monitors
   *
   */
  var ApplyGroupButton = Backbone.View.extend({
    initialize: function(){
      this.$el.html('<button style="position:absolute;top:0;right:0;" ' +
        ' class="btn btn-default" title="apply grouping">' +
        '<span class="glyphicon glyphicon-ok"></span></button>');
      this.$el.find('button').tooltip();
    },
    events:{
      'click button':function(event){
        this.trigger('click');
      }
    }
  });

  var GroupingSelectionView = BaseView.extend({
    initialize:function(options){
      BaseView.prototype.initialize.apply(this,arguments);
      this.selected = options.selected;
      this.confirmButton = new ApplyGroupButton();
      this.listenTo(this.confirmButton,'click',this.applyGrouping);
      this.changed = false;
    },
    applyGrouping:function(){
      var tags = this.find('select').val();
      var uri = URI();
      uri.removeSearch(/.*/);

      if (Array.isArray(tags)&&tags.length!==0) {
        tags.forEach(function(tag){
          uri.addQuery('tags',tag);
        });
      }

      window.location = uri.toString();
    },
    template:'<select name="tags" class="tags" ' +
      ' style="width:100%;" multiple></select>',
    events:{
      'change select':'onChangeSelect'
    },
    onChangeSelect:function(event){
      if (!this.changed) {
        this.changed = true;
        var $button = this.confirmButton;
        this.find('.select2.select2-container').append( $button.$el )
      }
    },
    render:function(){
      BaseView.prototype.render.apply(this);

      var data = this.collection.map(function(m){
        return {
          id: m.get('name'),
          text: m.get('name')
        }
      });

      var $select = this.find('select');
      // set initial values
      if (Array.isArray(this.selected)&&this.selected!==0) {
        this.selected.forEach(function(item){
          $select.append('<option value="'+item+'" selected>'+item+'</option>');
        });
      }
      $select.select2({
        //tags: true,
        multiple: true,
        placeholder: 'Grouping Tags',
        data: data
      });
    }
  });

  /**
   *
   * page index, main view.
   * all the other views render inside this
   *
   */
  var Index = BaseView.extend({
    autoRender: true,
    template: Templates['assets/templates/dashboard/page.hbs'],
    container: $('[data-hook=page-container]')[0],
    events:{
      'click [data-hook=up-and-running] i':'hideUpAndRunning',
      'click [data-hook=show-more-options]':'showMoreOptions',
    },
    initialize:function(options){
      BaseView.prototype.initialize.apply(this,arguments);

      this.monitors = options.monitors;
      this.monitorGroups = options.monitorGroups;
      this.tasks = options.tasks;
    },
    showMoreOptions:function(event){
      this.queryByHook('more-options').slideToggle();
      this.queryByHook('show-more-options').toggleClass('glyphicon-plus glyphicon-minus');
    },
    waitUntilStopInteraction:function(){
      var self = this;
      var timeout = setTimeout(function(){
        self.checkMonitors();
        self.monitorsFolding.fold();
      },10000); // wait 10 secs , and hide again

      $(document).one('click',function(){
        clearTimeout(timeout);
        self.waitUntilStopInteraction();
      });
    },
    hideUpAndRunning:function(event){
      this.$upandrunning.slideUp();
      this.$monitorsPanel.slideDown(); 
      this.waitUntilStopInteraction();
    },
    render:function(){
      BaseView.prototype.render.apply(this, arguments);

      this.monitorRows = this.renderCollection(
        this.monitorGroups,
        function(options){
          var model = options.model;
          if (model.get('type')=='group') {
            return new MonitorsGroupView(options);
          } else {
            return new MonitorView(options);
          }
        },
        this.queryByHook('monitors-container')[0]
      );

      if (this.tasks!==null) {
        this.renderCollection(
          this.tasks,
          TaskView,
          this.queryByHook('tasks-container')[0]
        );
        this.tasksFolding = new ItemsFolding(
          this.queryByHook('tasks-fold-container')
        );
      } else {
        //this.queryByHook('monitors-panel')
        //  .find('section.events-panel')
        //  .removeClass('col-md-6')
        //  .addClass('col-md-12') ;
        this.queryByHook('tasks-panel').remove();

        if (this.showStats===true) {
          $.get('/api/customer').done(function(customer){
            var stats = new PanelView({
              col_class:'col-md-6',
              title:'Stats',
              name:'stats',
              render:function(){
                PanelView.prototype.render.apply(this);
                var $container = this.queryByHook('panel-container');
                $container.append( $(customer.config.kibana) );
              }
            });
            stats.render();
            stats.$el.appendTo( $('.admin-container.dashboard') );
          });
        }
      }

      this.monitorsFolding = new ItemsFolding(
        this.queryByHook('monitors-fold-container')
      );
      this.$upandrunning = this.queryByHook('up-and-running');
      this.$monitorsPanel = this.find('[data-hook=monitors-container]');

      // events that can change monitors states
      // check state every time and reorganize view
      this.listenTo(this.monitors,'sync',this.checkMonitors);
      for (var i=0;i<this.monitorRows.views.length;i++) {
        var view = this.monitorRows.views[i];
        view.on('change:stateIcon',this.checkMonitors,this);
      }
      this.checkMonitors();

      // bind searchbox events
      var self = this;
      var searchbox = $.searchbox(); 
      searchbox.on('search:start',function(){
        log('searching');
        self.$upandrunning.slideUp();
        self.$monitorsPanel.slideDown();
        self.monitorsFolding.unfold();
      });
      searchbox.on('search:empty',function(){
        self.waitUntilStopInteraction();
      });

      this.find('.tooltiped').tooltip();

      this.grouping = new GroupingSelectionView({
        autoRender:true,
        selected: this.tagsSelected,
        el: this.queryByHook('grouping-select')[0],
        collection: this.monitors.tagsUnique()
      });
    },
    checkMonitors:function(){
      var failing = this.monitors.filter(function(monitor){
        var state = monitor.get('state');
        return state=='failure'||state=='updates_stopped';
      });

      if (failing.length>0) {
        this.foldMonitors();
        this.$upandrunning.slideUp();
        this.$monitorsPanel.slideDown();
        this.monitorsFolding.showButton();
      } else {
        this.unfoldMonitors();
        this.$upandrunning.slideDown();
        this.$monitorsPanel.slideUp();
        this.monitorsFolding.hideButton();
      }
    },
    /**
     * move ok monitors to fold
     */
    foldMonitors: function(){
      var self = this;
      this.find('.monitorRow').each(function(){
        var $row = $(this);
        var stateIcon = $row.find('.panel-heading .state-icon span')[0];
        if ( !/warn|error/.test(stateIcon.className) ) {
          $row.appendTo(self.monitorsFolding.$container);
        } else {
          $row.prependTo(self.$monitorsPanel);
        }
      });
    },
    /**
     * restore to default
     */
    unfoldMonitors: function(){
      var self = this;
      this.find('.monitorRow').each(function(){
        var $row = $(this);
        $row.appendTo(self.$monitorsPanel);
      });
    }
  });

  // anywere keypress event focus on search
  $(document).on('keypress',function(event){
    if (document.activeElement.tagName.toLowerCase()!='input') {
      $('.js-searchable-box input').focus();
    }
  });

  function attachToHost (monitors) {
    var typesToGroup=['host','dstat','psaux'],
      groups={},
      groupedMonitors = new Backbone.Collection();

    monitors.forEach(function(monitor){
      if (typesToGroup.indexOf(monitor.get('type')) !== -1) {
        if (!groups[monitor.get('hostname')]) {
          groups[monitor.get('hostname')] = {};
        }

        groups[monitor.get('hostname')][monitor.get('type')] = monitor;
      } else {
        monitor.set('submonitors', new Backbone.Collection());
        monitor.get('submonitors').add(monitor);
        groupedMonitors.add(monitor);
      }
    });

    for (var hostname in groups) {
      var group = groups[hostname];
      var host = group['host'];

      host.set('submonitors', new Backbone.Collection());
      host.get('submonitors').add([
        group['host'],
        group['dstat']
      ]);
      groupedMonitors.add(host);
    }

    return groupedMonitors;
  }

  function groupByTags (monitors,tags) {
    if (!Array.isArray(tags)||tags.length===0) {
      return monitors;
    }

    var groups = [];
    tags.forEach(function(t){
      groups.push({
        id: uid(),
        tags: [t,'group'],
        type: 'group',
        name: t.toLowerCase(),
        description: t,
        submonitors: new Backbone.Collection()
      });
    });

    monitors.forEach(function(monitor){
      var ctags = monitor.get('tags');
      if (!Array.isArray(ctags)||ctags.length===0) {
        return;
      }

      ctags.forEach(function(tag){
        var ltag = tag.toLowerCase();
        if (tags.indexOf(ltag) !== -1) {
          lodash.find(groups,function(g){
            return g.name == ltag 
          }).submonitors.add(monitor);
        } else {
          // do not group nor show. ignore
        }
      });
    });

    return new Backbone.Collection(groups);
  }

  //
  // The page starts here (if the method name did not say enough...)
  // fetch data, regroup, format, order and render page
  //
  (function start () {
    var monitors, tasks, synced;
    var tagsToGroup, query = URI().search(true);
    var credential = Cookies.getJSON('theeye').credential;

    if (Array.isArray(query.tags)) {
      tagsToGroup = query.tags.map(function(t){
        return t.toLowerCase() 
      });
    } else {
      if (typeof query.tags == 'string') {
        tagsToGroup = [query.tags.toLowerCase()];
      }
    }
    tagsToGroup = lodash.uniq(tagsToGroup);

    var MonitorsEvents = {
      update: function(resource){
        var monitor = monitors.get(resource.id);
        monitor.set(resource);
        monitors.sort();
      }
    };

    // connect sockets and start listening to events
    SocketsConnector({
      io: window.io,
      channel:'/events/subscribe',
      query: {
        customer: Cookies.getJSON('theeye').customer 
      },
      onSubscribed: function(data,jwres){
        log('subscribed to event updates');
      },
      events: {
        'events-update': MonitorsEvents.update
      }
    });

    if (query.tasks=='hide'||credential=='viewer') {
      // show only monitors
      monitors = new App.Collections.Monitors();
      monitors.once('sync',function(){
        var groups = groupByTags(attachToHost(monitors),tagsToGroup);
        new Index({
          monitorGroups: groups,
          monitors: monitors,
          tasks: null,
          showStats: (query.stats=='show'),
          tagsSelected: tagsToGroup
        });
      });
      monitors.fetch();
    } else {
      synced = lodash.after(2,function(){
        var groups = groupByTags(attachToHost(monitors),tagsToGroup);
        new Index({
          monitorGroups: groups,
          monitors: monitors,
          tasks: tasks,
          showStats: (query.stats=='show'),
          tagsSelected: tagsToGroup
        });
      });

      monitors = new App.Collections.Monitors();
      monitors.once('sync',synced);

      tasks = new App.Collections.Tasks();
      tasks.once('sync',synced);

      // fetch monitors and start page.
      monitors.fetch();
      tasks.fetch();
    }
  })();
}

// module.exports = DashboardPage;
