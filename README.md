# TheEye-Web

## PRE-Reqs

node 14

npm 6

## Installation

```bash
git clone
npm install
```

## Building

For compiling the assets and create the js/css bundles, it is required to choose a configuration file that should be placed in the directory src/config/ 
Use NODE_ENV to choose the required configuration env.

Use `NODE_ENV=production` to activate minification for production

## Building using Dockerfile

### Dockerfile

production Dockerfile. requires NODE_ENV=production

```

NODE_ENV=production docker build -t theeye-web:$(git describe) .


```

### Dockerfile.dev

development Dockerfile , NODE_ENV= can be anything, configuration file must exists in src/config directory

```

NODE_ENV=alpha docker build -f Dockerfile.dev -t theeye-web:$(git describe) .

```


### Using image build-in webserver built in

```
docker run --name theeye-webserver --expose 6082 --publish 127.0.0.1:6082:6082 theeye-web:$(git describe) npm run webserver
```


### Development

Hereunder we are assuming a file called src/config/dev.js exists and exports the config. See src/config/development.js for references.


```shell
NODE_ENV=development npm run build-dev

```

### Production

```shell
NODE_ENV=production npm run build-prod

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

