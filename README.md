[![Build Status](https://travis-ci.org/projectit-org/ProjectIt.svg?branch=development)](https://travis-ci.org/projectit-org/ProjectIt)

# ProjectIt
Projectional Editor for the Web.

![logo](/public/images/projectit.png)

## What is ProjectIt

ProjectIt is a TypeScript/JavaScript framework to create and implement projectional editors for Domain-Specific Languages (DSLs).

It is mostly unopinionated with regards to the models that can be projected, as long as you can make it observed using [MobX](https://mobx.js.org/).
The framework provides an internal projection DSL to specify layouts and typical editor behaviour.
It's the job of the developer of the projectional editor to map models to that projection DSL.
The framework provides standard functionality mostly for navigating in the editor, but also for deleting model elements.

ProjectIt provides full support for editing expressions with associativity and precedences, functionally equivalent to e.g. the MPS grammarcells.

For creating elements  the DSL implementor needs to 
provide callbacks for manipulating the state of the model based on actions in the editor.

## Developing ProjectIt

The main prerequisites are: [Node.js](https://nodejs.org/) and [yarn](https://yarnpkg.com/) and lerna.
We are typically using the latest versions of both, although older versions likely work just as well.
You could also try and use NPM instead of yarn.

To install lerna:

    yarn global add lerna

To setup the lerna structure:

    lerna bootstrap
    
Now you can build projectit with:

    lerna run build

To start the demo projectional editor:

    lerna run start
    
This will open a browser with the demo app on `http://localhost:3000/`.
The demo app is work in progress.

## Source organisation

* `.idea`: workspace files for the JetBrains' WebStorm that we use.
* `.vscode`: workspace files for the Visual Studio Code IDEs that we use (to be done).
* `dist`: target directory for WebPack.
* `docs`: documentation
* `packages/core`: framework source code.
* `packages/demo`: source code using the framework to implement a projectional editor for the demo language.
    The main entry point is `packages/demo/src/run.ts`.
* `packages/meta`: experimental source code using the framework to implement a projectional editor for a meta language..
* `packages/model`: source code for decorators that can be used to easily implement a language that can be directly used by ProjectIt.
* `/*`: the usual suspects.

