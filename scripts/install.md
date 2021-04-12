# Installing for deployment
## Requirements
Logictools uses [Composer (PHP)](https://getcomposer.org) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) for modules. They have been tested with versions composer `2.0.11` and npm `6.14.4`.

## Set up
Logictools is designed such that there is a source directory, which is not public, that is then compiled to an distribution directory which is then served by a web server. This is designed such that sensitive data such as keys and configuration files are not publicly accessible through the web server. For this example we will be using the locations `/git/logictools/` and `/www/logictools/` respectively but other locations can be used if needed.

### Cloning repo
You can clone the repo using the `git clone` command
```sh
$:/git git clone git@github.com:ideas-edu/logictools.git
```
### Creating distribution directory
In the `/www` directory create the `logictools` directory
```sh
$:/www mkdir logictools
```

## Compilation
You can use the `scripts/install.sh` script to compile the project to the distribution directory. The first argument is the output path, if you are using a location that differs from `/www/logictools` you must specify it here. The install script will download the necessary PHP and Node modules to the source directory.
```sh
$:/git/logictools . scripts/install.sh /www/logictools
```
The compiled source should not be in `/www/logictools`.

## Serving tool
You must now set up your web server to serve the files located in the distribution directory. You will also need to add a `Access-Control-Allow-Origin` header to allow calls to the backend located at [ideas.science.uu.nl](ideas.science.uu.nl). Logictools uses PHP and has been tested using version 7.4, the web server should be configured to use PHP. Here follows an example of how to set up the web server configuration for [NGINX](https://www.nginx.com).
```
location / {
    root /www/logictools;
    add_header Access-Control-Allow-Origin "ideas.science.uu.nl";
    try_files $uri $uri/ =404;
    location ~ \.php$ {
        include snippets/fastcgi-php7.4.conf;
    }
}
```
