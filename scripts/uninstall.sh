#!/bin/bash
## ----------------------------------------------------------------------------

# stopping the service
echo "Stopping services ..."
sudo service javascript-minifier-com stop
echo

# remove upstart script
echo "Removing upstart script ..."
sudo rm -f /etc/init/javascript-minifier-com.conf
echo

# remove log dirs
echo "Removing log dirs ..."
sudo rm -rf /var/log/javascript-minifier-com/
echo

# remove proximity conf
echo "Removing proximity config ..."
sudo rm /etc/proximity.d/javascript-minifier-com
echo

# finally, remove itself
rm -rf /home/chilts/src/appsattic-javascript-minifier-com

## ----------------------------------------------------------------------------
