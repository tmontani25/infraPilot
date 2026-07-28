#!/bin/bash
set -e
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y apache2 mysql-server php libapache2-mod-php php-mysql
systemctl enable apache2 mysql
systemctl restart apache2 mysql
echo "<?php phpinfo(); ?>" > /var/www/html/info.php
