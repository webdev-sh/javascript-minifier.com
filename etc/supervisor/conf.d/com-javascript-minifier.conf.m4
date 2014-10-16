[program:com-cssminifier]
command = sudo -E -u chilts __NODE__ __PWD__/server.js
directory = /home/chilts/src/chilts-javascript-minifier-com
user = __USER__
autostart = true
autorestart = true
stdout_logfile = /var/log/com-javascript-minifier/stdout.log
stderr_logfile = /var/log/com-javascript-minifier/stderr.log
environment = NODE_ENV="production"
