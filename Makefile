all:

server:
	DEBUG=blogz NODE_ENV=development supervisor --no-restart-on error -- server.js

server-prod:
	NODE_ENV=production supervisor --no-restart-on error -- server.js

test:
	curl -X POST -s --data-urlencode 'input@test/simple.js' http://localhost:8021/raw > test/simple.min.js
	curl -X POST -s --data-urlencode 'input@test/jquery.js' http://localhost:8021/raw > test/jquery.min.js
	curl -X POST -s --data-urlencode 'input@test/large.js'  http://localhost:8021/raw > test/large.min.js

test-remote:
	curl -X POST -s --data-urlencode 'input@test/simple.js' http://javascript-minifier.com/raw > test/simple.min.js
	curl -X POST -s --data-urlencode 'input@test/jquery.js' http://javascript-minifier.com/raw > test/jquery.min.js
	curl -X POST -s --data-urlencode 'input@test/large.js'  http://javascript-minifier.com/raw > test/large.min.js

clean:
	find . -name '*~' -exec rm {} ';'

.PHONY: server test clean
