# TheEye-Web

## Requirements
Tested under node 6.11.0 - npm 4.0.5

You'll need a `supervisor` instance to be able to run this web client (magical it is not)

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

####  Start your engines

```bash
npm run local
```

Another terminal:

```bash
npm run webpack
```

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

The [StandardJS][1] linter is installed and you can check your code whenever you want running:

```bash
./node_modules/standard/bin/cmd.js ./src/path/to/your/file.js
```

or blobing (mind the quotes):

```bash
./node_modules/standard/bin/cmd.js "./src/**/*.js"
```

It is not enforced. Yet. Read on the [StandardJS page][1] for more information about git commit hooks and rules.

[1]: https://github.com/feross/standard

### Pending

  [ ] Add production build steps in readme

  [ ] Enhance double build system

  [ ] Improve `devtool` setup for better readability

  [X] Be able of proper `css` requiring

  [x] Add mention about **Standard** implementation

  [ ] Bring changes guideline document from molaa repo
