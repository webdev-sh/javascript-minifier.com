## ----------------------------------------------------------------------------
#
# Bookmarks
#
# http://kvz.io/blog/2009/12/15/run-nodejs-as-a-service-on-ubuntu-karmic/
#
## ----------------------------------------------------------------------------

# info
description "javascript-minifier.com - Minify your JavaScripts- - Simple, Quick and Fast!"
author      "Andrew Chilton"

# respawn this task
start on runlevel [2345]
stop on runlevel [016]

# run as chilts
setuid __USER__
setgid __USER__

# respawn
respawn
respawn limit 20 5

# run inside this directory
chdir __PWD__

# allow opening of more than 1024 files
limit nofile 4096 4096

# set some environment variables
env NODE_ENV=production

# the script itself
script

    # quit the script if something goes wrong
    set -e

    # run the webserver as the user
    __NODE__ server.js >> /var/log/com-javascript-minifier/javascript-minifier.log

end script

## ----------------------------------------------------------------------------

