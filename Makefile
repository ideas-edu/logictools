# makefile only for deploying on the ideas server
#
# git clone https://github.com/ideas-edu/logictools.git

logex:
	scripts/install.sh /var/www/bas2 config-logex.json;

logax:
	scripts/install.sh /var/www/bas3 config-logax.json;

logind:
	scripts/install.sh /var/www/bas4 config-logind.json;