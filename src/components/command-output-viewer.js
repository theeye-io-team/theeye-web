import View from 'ampersand-view'

module.exports = View.extend({
  props: {
    stdout: ['string',true],
    stderr: ['string',true],
  },
  template: ``,
  render () {
    this.renderWithTemplate()
  }
})

    var JobResultView = function (options) {
      var container = options.container;
      var data = options.data, $tpl;

      if( data._type == 'ScraperJob' ){
        var t = document.querySelector('div[data-hook=scraper-job-result-template]');
        $tpl = $( t.innerHTML ); // create an element with the block content
        $tpl.find('div[data-hook=json-container]').jsonViewer( data.result );
      }

      if( data._type == 'ScriptJob' ){
        $tpl = $('div.resultTemplate div').first().clone().remove();
        var script_result = (data.result.script_result||data.result); // temporal fix
        $tpl.find('.scriptStdout').html(script_result.stdout);
        $tpl.find('.scriptStderr').html(script_result.stderr);
        // $tpl.addClass('col-md-12');
      }

      var $container = $( container );
      var $title = $container.find('.panel-title-content').first();
      $title.addClass('task-done');

      $tpl.one('close.bs.alert', function(){
        $title.removeClass('task-done');
        options.onClose && options.onClose();
      });

      $container.find('.panel-body [data-hook="job-result-container"]').append($tpl);
    };
