server:
	DEBUG=blogz NODE_ENV=development supervisor --no-restart-on error -- server.js

clean:
	find . -name '*~' -exec rm {} ';'

.PHONY: clean
