# makefile only for deploying on the ideas server
#
# git clone https://github.com/ideas-edu/logictools.git
# ln -s /var/www/assets/video video

LOGEXDIR  = /var/www/logex
LOGAXDIR  = /var/www/logax
LOGINDDIR = /var/www/logind


logex:
	scripts/install.sh $(LOGEXDIR) config-logex.json;
	ln -s /var/www/assets/video $(LOGEXDIR)/assets;

logax:
	scripts/install.sh $(LOGAXDIR) config-logax.json;
	ln -s /var/www/assets/video $(LOGAXDIR)/assets;

logind:
	scripts/install.sh $(LOGINDDIR) config-logind.json;
	ln -s /var/www/assets/video $(LOGINDDIR)/assets;