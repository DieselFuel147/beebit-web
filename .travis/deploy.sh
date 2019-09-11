#!/bin/bash -x

IP=beebithive.com
PORT=22
DEPLOY_DIR=/var/www/dev.beebithive.com/beebit-web

eval "$(ssh-agent -s)" # Start ssh-agent cache
chmod 600 .travis/pkey # Allow read access to the private key
ssh-add .travis/pkey # Add the private key to SSH

git config --global push.default matching
git remote add deploy ssh://git@$IP:$PORT$DEPLOY_DIR
git push deploy master

# Perform the installation of the npm project on the server
ssh apps@$IP -p $PORT <<EOF
  cd $DEPLOY_DIR
  npm install --production
  npm stop
  npm start &
EOF