all: build

build:
	npm ci
	npm run build
	npm ci --production

test:
	curl -X POST -s --data-urlencode 'input@test/simple.js' http://localhost:8021/raw > test/simple.min.js
	curl -X POST -s --data-urlencode 'input@test/jquery.js' http://localhost:8021/raw > test/jquery.min.js
	curl -X POST -s --data-urlencode 'input@test/large.js'  http://localhost:8021/raw > test/large.min.js

test-remote:
	curl -X POST -s --data-urlencode 'input@test/simple.js' https://javascript-minifier.com/raw > test/simple.min.js
	curl -X POST -s --data-urlencode 'input@test/jquery.js' https://javascript-minifier.com/raw > test/jquery.min.js
	curl -X POST -s --data-urlencode 'input@test/large.js'  https://javascript-minifier.com/raw > test/large.min.js

.PHONY: server test clean
