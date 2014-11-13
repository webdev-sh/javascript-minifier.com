[program:__NAME__]
command = sudo -E -u chilts __NODE__ __PWD__/server.js
directory = __PWD__
user = __USER__
autostart = true
autorestart = true
stdout_logfile = /var/log/__NAME__/stdout.log
stderr_logfile = /var/log/__NAME__/stderr.log
environment = NODE_ENV="production"
