# BeeBit Operations

This repository contains the working tree of **The BeeBit Website**, including the **BeeBit Hive** and API endpoints for the IoT component.

Please see [the IoT repository](https://github.com/winzlebee/beebit-iot) for the C++ component running on the devices.

## General Running Instructions

## Website

The framework for the website is hosted using NodeJS, specifically version 12.x

To get the latest version installed in debian, do the following;

```sh
# Using Debian, as root
curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs
```

Once in the root directory, run:

```sh
npm install
```

To install all dependancies. Next run:

```sh
npm start
```

To run as normal.

## Commit Script

Anything that is pushed to the *master* branch of this repository is automagically deployed to https://app.beebithive.com
Therefore make sure your changes run! Only basic checks are made, attempting to run `npm start` only.

## Test Data

Currently to simulate data from the raspberry pi you can run test.py in the test folder.