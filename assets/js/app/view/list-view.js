/* global BaseView, bootbox */
var ListView = BaseView.extend({
  // Extendable setup, change these values when extending this view
  itemTitle: 'Item',
  itemTitlePlural: 'Items',
  itemNoun: 'item',
  itemNounPlural: 'items',
  apiUrlEndpoint: '/nonsense/',

  defaultEvents:{
    "click .massChecker": "massCheckerToggle",
    "uncheck .massChecker": "massCheckerUncheck",
    "click .rowSelector": "rowSelectorClick",
    "check .rowSelector": "rowSelectorCheck",
    "uncheck .rowSelector": "rowSelectorUncheck",
    "itemchanged .massChecker": "onItemChanged",
    "click .massDelete": "massDelete"
  },
  rowSelectorCheck: function(evt){
    var $this = $(evt.currentTarget);
    var $spanIcon = $this.children('span').first();
    $this.data('checked',true);
    $spanIcon.addClass('glyphicon-check');
    $spanIcon.removeClass('glyphicon-unchecked');
    $this.closest('.itemRow').addClass('selectedItem');
  },
  rowSelectorUncheck: function(evt){
    var $this = $(evt.currentTarget);
    var $spanIcon = $this.children('span').first();
    $this.data('checked',false);
    $spanIcon.removeClass('glyphicon-check');
    $spanIcon.addClass('glyphicon-unchecked');
    $this.closest('.itemRow').removeClass('selectedItem');
  },
  rowSelectorClick: function(evt) {
    var $this = $(evt.currentTarget);
    evt.stopPropagation();
    evt.preventDefault();
    if($this.data('checked')) {
      $this.trigger('uncheck');
      // Notify MASS CHECKER
      $('.massChecker').trigger('itemchanged');
    }else{
      $this.trigger('check');
    }
    $this.blur();
  },

  massCheckerUncheck: function(evt){
    var $this = $(evt.currentTarget);
    var $spanIcon = $this.children('span').first();
    $this.data('checked',false);
    $spanIcon.removeClass('glyphicon-check');
    $spanIcon.addClass('glyphicon-unchecked');
    $('.rowSelector').trigger('uncheck');
  },
  massCheckerToggle: function(evt){
    var $this = $(evt.currentTarget);
    evt.stopPropagation();
    var $spanIcon = $this.children('span').first();
    if($this.data('checked')) {
      //uncheck all by firing event
      $this.trigger('uncheck');
    }else{
      // do an "uncheck all", there maybe some left from a prior search
      // this should be hooked on the search event
      $('.rowSelector').trigger('uncheck');
      $('.rowSelector:visible').trigger('check');
      $this.data('checked',true);
      $spanIcon.addClass('glyphicon-check');
      $spanIcon.removeClass('glyphicon-unchecked');
    }
    $this.blur();
  },

  onItemChanged: function(evt){
    var $this = $(evt.currentTarget);
    var $spanIcon = $this.children('span').first();
    $('.rowSelector:visible').each(function(i,e){
      if(!$(e).data('checked')) {
        $this.data('checked', false);
        $spanIcon.removeClass('glyphicon-check');
        $spanIcon.addClass('glyphicon-unchecked');
        return;
      }
    });
  },

  massDelete: function(evt){
    console.log(evt);
    var $this = $(evt.currentTarget);
    evt.preventDefault();
    var textRows = "";
    var ids = [];
    var firstConfirmHeader = '<h1>Massive '+this.itemNoun+' delete</h1>Heads up!<br /><br />';
    var firstConfirmFooter = '<br />will be deleted.<h2>Are you sure?</h2>';
    var secondConfirmHeader = '<h1>Wait, really sure?</h1>' +
      'Please review the list, just in case:<br /><br />';
    var secondConfirmFooter = '<br />WILL BE DELETED<h2>Confirm wisely</h2>';
    var successTitle = this.itemTitlePlural + ' deleted';
    var successFooter = '<br/>...you will be missed :(';
    var failTitle = this.itemTitlePlural + ' deleted (some)';
    var failFooter = '<br/>...I tried to delete these ' + this.itemNounPlural +
      ' yet some of them came back with errors.' +
      '<br /><br />Please refresh now and try again';
    var dataId = "itemId"; // the data-something where we get the id of the item
    var dataDescriptor = "itemName"; // the data-something where we get the name of the item
    var listTemplate = "{descriptor} ({id})<br />";
    var itemSelector = 'div.itemRow.selectedItem:visible';
    // var apiUrlEndpoint = '/task/';
    var apiRequestType = 'DELETE';
    var self = this;

    //collect selected rows.data (dataId & dataDescriptor)
    $(itemSelector).each(function(i,e){
      var itemId = $(e).data(dataId);
      var itemName = $(e).data(dataDescriptor);
      if(itemId) {
        ids.push(itemId);
        var listItem = listTemplate
          .replace("{id}", itemId)
          .replace("{descriptor}", itemName);
        //concatenate notification rows
        textRows = textRows + listItem;
      }
    });
    if(textRows) {
      bootbox.confirm(firstConfirmHeader + textRows + firstConfirmFooter, function(result1){
        if(!result1) {
          return;
        }
        bootbox.confirm(secondConfirmHeader + textRows + secondConfirmFooter, function(result2){
          if(!result2) {
            return;
          }
          $.blockUI();
          var deleteRequests = [];
          var removeOnSuccess = function(id) {
            $('div.itemRow[data-item-id='+id+']').remove();
          };
          for(var ii = 0; ii < ids.length; ii++) {
            var taskId = ids[ii];
            deleteRequests.push(
              $.ajax({
                url: self.apiUrlEndpoint + taskId,
                type: apiRequestType,
                // on success remove div[data-item-id=itemId]
                success: (function(id){
                  return removeOnSuccess(id);
                })(taskId)
              })
            );
          }

          // que es esto chris? borre todos los console.logs
          // esto agarra el array deleteRequests y ejecuta todos los requests
          // es similar a lo que haces vos con lodash.after --
          // restaure las funciones de success/fail que habias sacado
          $.when.apply($, deleteRequests)
          .then(
            // success
            function(){
              alert(textRows + successFooter, successTitle);
            },
            // fail
            function(){
              alert(textRows + failFooter, failTitle);
            }
          )
          .progress(function(){})
          .always(function(){ $.unblockUI(); })
          .done(function(){});
        });
      });
    }
    $this.blur();
    return false;
  }

});
