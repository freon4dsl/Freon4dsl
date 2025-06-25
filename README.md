[![Build Status](https://github.com/freon4dsl/freon4dsl/actions/workflows/node.js.yml/badge.svg)]

# Freon, the Language Workbench for the Web
Web-native Language Workbench with projectional editor. 
The current release (version 1.0.0) can be found on npm.

**May 13, 2025: Version 1.1.0-beta.3 released**

- Updated to use Svelte 5 instead of Svelte 4.
- Performance improvements in generation and really fast hot reloading thanks to vite.

**May 13, 2025: IDE plugin version 0.0.4 released**
- See [https://github.com/freon4dsl/freon-ide/blob/main/README.md](https://github.com/freon4dsl/freon-ide/blob/main/README.md)

## What is Freon

Freon is a TypeScript/JavaScript framework to create and implement projectional editors for Domain-Specific Languages (DSLs) running natively in the browser. 
Additional to the core framework, there are generators for many parts of the work environment for your DSL.

For more information see the <a href="https://www.freon4dsl.dev" target="_blank">Freon</a> website.

## Using Freon

If you want to use Freon to develop a DSL on the Web, goto the [Freon Documentation](https://www.freon4dsl.dev),
this repository is meant for developing Freon itself.

## Developing Freon

The main prerequisites are: [Node.js](https://nodejs.org/) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/).
We are typically using the latest versions of both, although older versions likely work just as well.

Clone or fork this GitHub project, check out the `development` branch, and install dependencies:
```bash
  git clone https://github.com/freon4dsl/Freon4dsl.git
```
Set up the multirepo and install all dependencies:
```bash
  npm install
```

Now you can build Freon with:
```bash
  npm run build
```

And run all tests  with:
```bash
  npm run test
```

## Starting the web app editor
* Go to the package containing your language, this can e.g. be any package in `packages/samples`.
  - Build the language using `npm run build`

* Go to the `webapp-starter` package.
  - Open the file `package.json
  - In the _dependencies_ section change the language dependency to your chosen language:
  ```json lines
  "@freon4dsl/samples-course-schedule": "1.1.0-beta.3",
  ```
  - Also open the file `src/starter.ts`
  - Change line 5 to import the correct environment from your chosen language package:
  ```typescript
  import { LanguageEnvironment } from "@freon4dsl/samples-course-schedule" 
  ```

* Go to directory `packages/server` and start the server:
```bash
    cd packages/server
    npm run start
```

* Goto the `webapp-starter` and start Freon:
```bash
    cd packages/webapp-starter
    npm run prepare-app
    npm run dev
```
This will open a browser with the example from the samples/Example package on 
the URL displayed: `http://localhost:5000/`. The example and all other projects in samples are
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
* *packages/server*: source code for a minimalistic model-server used for demonstration purposes.
* *packages/webapp-lib*: source code for the web-application used for all generated languages.
* *packages/samples/*: source code for a number of sample languages.
* *packages/webapp-starter/*: source code for web app including one language.
  This package import the `webapp-lib` for the full web app and one language from `samples` to be used in the webapp.
* _/*_: the usual suspects.

