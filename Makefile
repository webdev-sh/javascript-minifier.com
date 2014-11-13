all:

server:
	DEBUG=blogz NODE_ENV=development supervisor --no-restart-on error -- server.js

test:
	curl -X POST -s --data-urlencode 'input@test/simple.js' http://localhost:8021/raw > test/simple.min.js
	curl -X POST -s --data-urlencode 'input@test/jquery.js' http://localhost:8021/raw > test/jquery.min.js

clean:
	find . -name '*~' -exec rm {} ';'

.PHONY: server test clean
