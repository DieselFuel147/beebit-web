#!/bin/bash -x

IP=beebithive.com
PORT=22
DEPLOY_DIR=/var/www/dev.beebithive.com/beebit-web

eval "$(ssh-agent -s)" # Start ssh-agent cache
chmod 600 .travis/pkey # Allow read access to the private key
ssh-add .travis/pkey # Add the private key to SSH

# Revert untracked server files
ssh apps@$IP -p $PORT <<EOF
  cd $DEPLOY_DIR
  git checkout -- .
EOF

# Perform the installation of the npm project on the server
git checkout -- .
git config --global push.default matching
git remote add deploy ssh://git@$IP:$PORT$DEPLOY_DIR
git push --force deploy master

# Perform the installation of the npm project on the server
ssh apps@$IP -p $PORT <<EOF
  cd $DEPLOY_DIR
  npm install --production
  pm2 stop all
  chown -R apps ./db
  pm2 start
EOF