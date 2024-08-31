#!/bin/bash

# Update and upgrade apt
sudo apt update && sudo apt upgrade -y

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# Load nvm into the current shell session
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js (latest LTS version)
nvm install --lts

# Install pm2 globally
npm install -g pm2

# Install Certbot for HTTPS
sudo apt install certbot python3-certbot-nginx -y

# Obtain and install an SSL certificate
sudo certbot --nginx -d polaris.cheaprpc.com --email azuldevgames@gmail.com --agree-tos --non-interactive --redirect

# Reload Nginx to apply changes
sudo systemctl reload nginx
