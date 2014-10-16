#!/bin/bash
## ----------------------------------------------------------------------------

set -e

## ----------------------------------------------------------------------------
# Set these to your preferred values.

THIS_USER=`id -un`
THIS_GROUP=`id -gn`
THIS_PWD=`pwd`
THIS_NODE=`which node`

## ----------------------------------------------------------------------------

# install any required packages
echo "Installing new npm packages ..."
npm update --production
echo

# minimising assets
echo "Minimising assets ..."
curl        \
    -X POST \
    -s      \
    --data-urlencode 'input@public/s/js/ready.js' \
    http://javascript-minifier.com/raw > public/s/js/ready.min.js
curl        \
    -X POST \
    -s      \
    --data-urlencode 'input@public/s/css/style.css' \
    http://cssminifier.com/raw > public/s/css/style.min.css
echo


# set up Nginx
echo "Setting up Nginx ..."
FILE=/tmp/com-javascript-minifier
cat /dev/null > $FILE
nginx-generator \
    --name com-javascript-minifier \
    --domain javascript-minifier.com \
    --type proxy \
    --var host=localhost \
    --var port=8021 \
    - >> $FILE
nginx-generator \
    --name com-javascript-minifier-www \
    --domain www.javascript-minifier.com \
    --type redirect \
    --var to=javascript-minifier.com \
    - >> $FILE
nginx-generator \
    --name com-javascript-minifier-ww \
    --domain ww.javascript-minifier.com \
    --type redirect \
    --var to=javascript-minifier.com \
    - >> $FILE
nginx-generator \
    --name com-javascript-minifier-w \
    --domain w.javascript-minifier.com \
    --type redirect \
    --var to=javascript-minifier.com \
    - >> $FILE
sudo cp $FILE /etc/nginx/sites-enabled/
echo

# set up the server
echo "Setting up various directories ..."
sudo mkdir -p /var/log/javascript-minifier-com/
sudo chown $THIS_USER:$THIS_GROUP /var/log/javascript-minifier-com/
echo

# add the upstart scripts
echo "Copying upstart script ..."
m4 \
    -D __USER__=$THIS_USER \
    -D __NODE__=$THIS_NODE \
    -D  __PWD__=$THIS_PWD   \
    -D __NODE__=$THIS_NODE \
    etc/init/javascript-minifier-com.conf.m4 | sudo tee /etc/init/javascript-minifier-com.conf
echo

# restart the service
echo "Restarting service ..."
sudo service javascript-minifier-com restart
sudo service proxie restart
echo

## ----------------------------------------------------------------------------
