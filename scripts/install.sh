#!/bin/bash
## ----------------------------------------------------------------------------

set -e

## ----------------------------------------------------------------------------
# Set these to your preferred values.

THIS_USER=`id -un`
THIS_GROUP=`id -gn`
THIS_PWD=`pwd`
THIS_NODE=`which node`
THIS_PATH=`dirname $THIS_NODE`

NAME=com-javascript-minifier
NAKED_DOMAIN=javascript-minifier.com
PORT=8021

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

# set up the server
echo "Setting up various directories ..."
sudo mkdir -p /var/log/$NAME/
sudo chown $THIS_USER:$THIS_GROUP /var/log/$NAME/
echo

# add the upstart scripts
echo "Copying init script ..."
m4 \
    -D __USER__=$THIS_USER \
    -D  __PWD__=$THIS_PWD  \
    -D __NODE__=$THIS_NODE \
    -D __NAME__=$NAME      \
    -D __PATH__=$THIS_PATH \
    etc/init/$NAME.conf.m4 | sudo tee /etc/init/$NAME.conf
echo

# restart services
echo "Restarting services ..."
sudo service com-javascript-minifier restart
echo

## ----------------------------------------------------------------------------
