#!/bin/bash
## --------------------------------------------------------------------------------------------------------------------

set -e

# install any required packages
echo "Fetching new code ..."
git fetch
git rebase origin/master
echo

# install any required packages
echo "Installing new npm packages ..."
npm install
echo

# minimising assets
echo "Minimising assets ..."
# ToDo: js-min.pl public/s/js/ready.js > public/s/js/ready.min.js
# ToDo: curl -X POST -s --data-urlencode 'input@public/s/css/style.css' http://cssminifier.com/raw > public/s/css/style.min.css
echo

# set up Nginx
echo "Setting up Nginx ..."
sudo cp etc/nginx/sites-available/javascript-minifier-com /etc/nginx/sites-available/
if [ ! -h /etc/nginx/sites-enabled/javascript-minifier-com ]; then
    sudo ln -s /etc/nginx/sites-available/javascript-minifier-com /etc/nginx/sites-enabled/
fi
sudo service nginx reload
echo

# set up the servers
echo "Setting up various directories ..."
sudo mkdir -p /var/log/javascript-minifier-com/
sudo chown ubuntu:ubuntu /var/log/javascript-minifier-com/
echo

# add the upstart scripts
echo "Copying upstart script ..."
sudo cp etc/init/javascript-minifier-com.conf /etc/init/
echo

# restart the service
echo "Restarting service ..."
sudo service javascript-minifier-com restart
echo

## --------------------------------------------------------------------------------------------------------------------
