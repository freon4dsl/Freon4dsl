# Test Scenarios Intro

This folder contains test scenarios that should be performed by hand. Starting 
with scenarios for model and unit manipulation in the webapp, the tests drill down into the
various parts of the editor (implemented in core/core-svelte).

There are also test webpages in the core-svelte package, which should also be checked.

## The available scripts
 * Models and Units: the functionality of the webapp concerning manipulation of models and model units.
 * Editor Web Actions: the functionality of the webapp concerning actions with regard to the editor content, like cut, paste.
 * Core Editor Actions: the functionality of the core editor.
 * Editing Expressions: the functionality concerning expressions in the core editor.

## How to work with these Tests

For each mayor test series, take a copy of the test scripts in folder Basis and put them in a designated folder. 
Then perform the tests and add any errors found and/or comments in the copied file. (This keeps the base files clean!)
Of course, any errors found need to be fixed and checked again.
