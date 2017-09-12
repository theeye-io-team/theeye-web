import View from 'ampersand-view'

export default View.extend({
  autoRender: true,
  template: `<nav class="navbar navbar-inverse navbar-fixed-top">
              <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                  <span class="sr-only">Toggle navigation</span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="/dashboard"><img src="/images/logo-hor.png" alt="The eye"></a>

              </div>
              <div id="navbar" class="navbar-collapse collapse">
                <ul class="navbar-right">
                </ul>
              </div>
            </nav>`
});
