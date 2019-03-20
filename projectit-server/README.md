# ProjectIt Model Server

This is a straightforward, simple model server, which can be be used with the ProjectIt editor.
There are exactly two possible requests:

* `putModel` stores an incoming JSON model in a local file.
* `getModel` returns the contents of the local file as JSON.


## Getting Started
Install and run
```
yarn i
yarn run watch-server
```

# Future

This model server is currently not the main focus of the ProjectIt project, but it might gradually be enhanced to get more advanced functionality, such as:

* There should be the possibility to store models with a name, such that multiple models can be stored.\

* Further ahead,  the server should start working with Delta's, containing only the changes made in a model.
* Storage should be done in a database, instead of files.
* ...