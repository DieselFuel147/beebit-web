# BeeBit Operations

This repository contains the working tree of **BeeBit**, including the **BeeBit Hive** and all related materials.

## General Compilation Instructions

For specific instructions, please visit the subdirectories 'Device' and 'Website' and consult relevant readme files.

All C-derived programs are provided with a makefile, so entering the directory and typing *make* should be sufficient.

## Website

The framework for the website is hosted using NodeJS, specifically version 12.x

To get the latest version installed in debian, do the following;

```sh
# Using Debian, as root
curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs
```