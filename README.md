[![Build Status](https://github.com/freon4dsl/freon4dsl/actions/workflows/node.js.yml/badge.svg)]

# Freon, previously know as ProjectIt
Projectional Editor for the Web. The current release (version 0.6.0-beta.0) can be found on npm.

This beta release supports [LionWeb](https://github.com/LionWeb-io) (de)serialization. 
As LionWeb is in motion, excpect this release to change according to LionWeb changes before it becomes final. 

## What is Freon

Freon is a TypeScript/JavaScript framework to create and implement projectional editors for Domain-Specific Languages (DSLs). 
Additional to the core framework, there are generators for many parts of the work environment for your DSL.

For more information see the <a href="https://www.freon4dsl.dev" target="_blank">Freon</a> website.

## Developing Freon

The main prerequisites are: [Node.js](https://nodejs.org/) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/).
We are typically using the latest versions of both, although older versions likely work just as well.

Clone or fork this github project, check out the `development` branch, and install dependencies:
```bash
  git clone https://github.com/freon4dsl/Freon4dsl.git
```
Setup the multirepo and install all dependencies:
```bash
  npm install
```

Now you can build Freon with:
```bash
  npm run build
```

Choose one of the projects in playground. Note that not all of them will work correctly (it is a playground :-)). 
Generate the code for that project (we have choosen the 'example' project):
```bash
  cd packages/playground
  npm run install-example
  npm run example
```

To start the projectional editor for the choosen language in the playground package,
do two things in separate terminals:

Go to directory `packages/server` and start the server:
```bash
    cd packages/server
    npm run start
```

Goto the playground directory `packages/playground` (or stay there if you are already there) and start Freon:
```bash
    cd packages/playground
    npm run prepare-app
    npm run dev
```   
This will open a browser with the example from the playground package on 
the URL displayed: `http://localhost:5000/`. The example and all other projects in playground are
work in progress.

## Source organisation

The source code for Freon is organised into the following packages.

* *docs*: documentation, i.e. this website
* *packages/core*: framework source code.
* *packages/core/src/editor*: the editor framework source code.
* *packages/core/src/language/decorators*: source code for <a href="https://mobx.js.org/" target="_blank">MobX</a> decorators that can be used to easily implement a language that can be
  directly used by Freon.
* *packages/meta*: source code that reads the language definition files and generates the language environment.
* *packages/meta/src/languagedef*: source code that generates code from a language structure definition (*.ast*) file.
* *packages/meta/src/editordef*: source code that generates code from an editor definition (*.edit*) file.
* *packages/meta/src/scoperdef*: source code that generates code from a scoper definition (*.scope*) file.
* *packages/meta/src/typerdef*: source code that generates code from a typer definition (*.type*) file.
* *packages/meta/src/validatordef*: source code that generates code from a validator definition (*.valid*) file.
* *packages/playground*: source code generated from the language definition files.
* *packages/playground/src/webapp*: a copy of *packages/webapp*, for use within the playground.
* *packages/playground/src/example/defs*: the language definition files for the example language called 'Example'.
* *packages/server*: source code for a minimalistic model-server used for demonstration purposes.
* *packages/webapp*: source code for the web-application used for all generated languages.
* _/*_: the usual suspects.

