# makefile only for deploying on the ideas server
#
# git clone https://github.com/ideas-edu/logictools.git
# ln -s /var/www/assets/video video

logex:
	scripts/install.sh /var/www/logex config-logex.json;
	ln -s /var/www/assets/video /var/www/logex/assets/video;

logax:
	scripts/install.sh /var/www/logax config-logax.json;
	ln -s /var/www/assets/video /var/www/logax/assets/video;

logind:
	scripts/install.sh /var/www/logind config-logind.json;
	ln -s /var/www/assets/video /var/www/logind/assets/video;