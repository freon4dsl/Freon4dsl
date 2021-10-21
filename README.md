[![Build Status](https://app.travis-ci.com/projectit-org/ProjectIt.svg?branch=development)](https://app.travis-ci.com/github/projectit-org/ProjectIt)

# ProjectIt
Projectional Editor for the Web.

**NOTE**: ProjectIt has changed significantly since the last release and includes quite a lot more functionality
for developing languages.
You should look into the _development_ branch to see the current state of ProjectIt.

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

The main prerequisites are: [Node.js](https://nodejs.org/) and [yarn](https://yarnpkg.com/).
We are typically using the latest versions of both, although older versions likely work just as well.
You could also try and use NPM instead of yarn.

To install lerna:

    yarn global add lerna

Now clone projectit:

    git clone git@github.com:projectit-org/ProjectIt.git

and ensure you are in the `development`  branch.

To setup the lerna structure:

    yarn bootstrap
    
Now you can build ProjectIt with:

    yarn build

And run the tests with

    yarn test

To start the projectional editor for the example language in the playground package,
do two things in separate terminals:

Go to directory `packages/server` and start the server:

    cd packages/server
    yarn start

Goto the playground directory `packages/playground` and start ProjectIt:

    cd packages/playground
    yarn dev
    
This will open a browser with the example app from the playground package on the URL displayed: `http://localhost:5000/`.
The example app is work in progress.

## Source organisation

The overall source code is organised as follows: 

* `.idea`: workspace files for the JetBrains' WebStorm that we use.
* `.vscode`: workspace files for the Visual Studio Code IDEs that we use (we don't use this much).
* `docs`: The generated documentation
* `packages/core`: ProjectIt framework source code.
* `packages/core-svelte`: svelte implementation of ProjectIt.
* `packages/docs`: the documentation source.
* `packages/playground`: source code using the framework to implement a projectional editor for a number of languages.
* `packages/meta`: the ProjectIt specification dsl's source code and generators.
* `packages/server`: server project, a bare bones server for ProjectIt.
* `packages/test`: test project 
* `scripts`: some helper scripts 

