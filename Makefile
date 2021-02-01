default: hints jslint doc

JSHINT = ~/node_modules/jshint/bin/jshint --reporter ~/node_modules/jshint-html-reporter/reporter.js
JSLINT = ~/node_modules/jslint/bin/jslint.js
JSDOC  = ~/node_modules/jsdoc/jsdoc.js

JSFILES = js/*.js js/controller/*.js js/model/*.js js/model/oneway/*.js js/model/twoway/*.js

hints: hints.html

hints.html: $(JSFILES)
	$(JSHINT) $(JSFILES) > $@

jslint: jslint.txt

jslint.txt: $(JSFILES)
	$(JSLINT) $(JSFILES) > $@
	
doc: out/index.html
	
out/index.html: $(JSFILES)
	$(JSDOC) $(JSFILES)