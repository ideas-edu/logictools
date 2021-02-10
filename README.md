# logictools
Logic tools

# Developer Installation
You will need to have HTTP server running to serve the files. LogEx uses local and session storage, which will not work correctly if accessing the pages through files. If you have Python 3 installed you can use the following command in the root directory of the project to serve the files.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Refer to [this AskUbuntu post](https://askubuntu.com/questions/1102594/how-do-i-set-up-the-simplest-http-local-server) for alternatives for setting up a simple HTTP server. Please remember this server is only to be used for local development and never for production.

# Documentation
You will need to install the following components to use the documentation generator.
```sh
npm install jshint jslint jsdoc jshint-html-reporter
```
Running the [Makefile](Makefile) with the command `make` will generate documentation in the `docs` directory.
