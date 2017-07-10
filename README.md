# TheEye-Web

## Requirements
Tested under NodeJS 4.4.5

You'll need a `supervisor` instance to be able to run this web client

## Installation

```bash
git clone https://bitbucket.org/interactar/web
cd web
npm install
```

**NOTE:** After `npm` has installed you'll have to manually install a `sails` dependency
due to a minor flaw on `sails` dependencies declaration:

```bash
cd node_modules/sails
npm install grunt-cli
```

## Running

Default `npm` script `local` uses `NODE_ENV=localdev`, so you should create your
`config/localdev.js` and adjust it to your needs. Then run:

```bash
npm run local
```

Changes are monitored by `nodemon` so whenever you save a file the client is restarted
to reflect the changes.

## Modules and migration

We are currently migrating to `webpack` bundler. At this point the process is
quite basic and manual. Files are taken one at a time since this is no SPA, all
pages work independently, but thanks to `webpack` magic we are storing common
code on a shared chunk file (`assets/js/application/common.bundle.js`)

### Working with pages

An entry (will) exist on `webpack.config.js` file for each page:
```js
entry: {
  scheduler: './src/scheduler/index.js',
  user: './src/user/index.js',
  tasks: './src/tasks/index.js'
},
```
Those are starting points of each javascript file for the pages (usually named
the same way as the page), they will end up in `assets/js/application/[entry name].bundle.js`.

Also, there is a `resolve` configuration in `webpack` so that you can `import`
or `require` directly from `./src`, so ...

```javascript
// file ./src/scheduler/index.js you can
import 'init'  // will import ./src/init.js (or init/index.js)
import CalendarView from 'components/calendar'
// the above line will get you ./src/components/calendar/index.js

import 'bootstrap' // will also work, since ./node_modules is also on the path
```

### Starting a page migration

There are a couple of steps involving the migration of a page.

First of all, THOU SHALL NOT MIGRATE WITHOUT A TEST. Not an automated test.
A real test, where you poke around on the page and, AT THE VERY LEAST,
the new page will fail in whatsoever was failing the original one.

Because of this, the migration involves these steps:

####  1. Create a new route

Edit `./config/routes.js` and add `/new` path to the page you will work on.
For example, let's create the new `/admin/scripts` index page:
```javascript
// this is the endpoint:
'get    /admin/script' : 'ScriptController.index',

// so you add:
'get    /admin/script/new' : 'ScriptController.test1',

```

####  1. Replicate the current endpoint
Edit the `ScriptController` (or whatever controller is controlling the page you
want), search for the function that's responsible for the page rendering and
duplicate it, then rename it `test1` (you get the idea, use your function naming
ability), and specify **layout** and **template**. Template being the filename
of the template view (i.e. `views/script/test1.ejs`) and the layout is a
commonly used layout `layout-ampersand.ejs`

./api/controllers/ScriptController:
```javascript
index: function (req, res, next) {
  res.view({data: []})
}
// becomes this
test1: function (req, res, next) {
  res.view('script/test1', // this is the path to the view file, in case you didn't notice
    {
      data: [], // this is the original data from the method above
      layout: 'layout-ampersand' // guessed it?
    }
  )
}
```

####  2. Create your `.ejs` view file
Copy the current view:
```bash
cp ./views/script/index.ejs ./views/script/test1.ejs
```

**NOTE** at this point you could start the application and you
should see a page without _backend_ errors at http://localhost:6080/admin/script/new

----------------------

Get rid of all undesired code and leave, at the very least, an
identifiable DomNODE and the script tag:
```html
<div id="leIdentifiableDiv"></div>

<% block("scripts" , '<script src="/js/application/script.bundle.js"></script>') %>
```
We will be rendering an AmpersandView in it.

####  3. Create an entry on `webpack.config.js`
```javascript
entry: {
  scheduler: './src/scheduler/index.js',
  user: './src/user/index.js',
  // this is your new line:
  script: './src/script/index.js'
},
```
Never underestimate the power of irony in building a script file which
is a bundle of scripts compiled and it will be placed in a `<script>` tag
and it's name... will be `script`. Think of that.

####  4. Create your starting script file
```bash
mkdir ./src/script && touch ./src/script/index.js
```

####  5. Start your engines
```bash
npm run local
```
Another terminal:
```bash
npm run webpack
```

####  6. And code your page:
```javascript
import 'init'
import BaseView from 'base-view'
import 'bootstrap' // important!

const ScriptPageView = BaseView.extend({
  props: {
    welcomeWagon: 'string'
  }
  template: `<h1>Ehlo page. script says
    <span data-hook="welcome-message"></span></h1>`,
  bindings: {
    welcomeWagon: { hook: 'welcome-message' }
  }
})

new ScriptPageView({
  welcomeWagon: 'Voila!',
  el: document.getElementById('leIdentifiableDiv')
})
```

Go to your browser and load http://localhost:6080/admin/script/new

### Issues

#### Page forbidden
If you encounter your page with a `forbidden` error/message, you should check
the ACL configuration on `config/acl.js`.

You should see something like this:
```javascript
  ...
  'script' : ['*'],
  ...
```
for each user role.

#### Web developer tools
When inspecting/debugging on the browser's developer console, sometimes the
reference is made to the _packed_ file. It's not so bad, but you have to know
your code. If you lose yourself among the files, check on the _Sources_ tab
and try to inspect files under `webpack://` protocol. You should find there
a file tree just like the one on your filesystem.

#### I imported a `css` file but I only see it on a `<style>` tag.
Yes. This is a feature. When you import a `css` file it will be parsed
and included (appended) on the `<head>` as a `<style>` tag.

Which is neat, but beware of the _cascade styling shit_.


### Code styling
The [StandardJS][1] linter is installed and you can check your code whenever you
want running:
```bash
./node_modules/standard/bin/cmd.js ./src/path/to/your/file.js
```
or blobing (mind the quotes):
```bash
./node_modules/standard/bin/cmd.js "./src/**/*.js"
```

It is not enforced. Yet. Read on the [StandardJS page][1] for more information about git commit
hooks and rules.

[1]: https://github.com/feross/standard

### Pending

  [] Add production build steps in readme

  [] Enhance double build system

  [] Improve `devtool` setup for better readability

  [] Be able/add readme steps for proper `css` requiring

  [x] Add mention about **Standard** implementation

  [] Bring changes guideline document from molaa repo
