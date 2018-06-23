#!/bin/bash
set -e
ssh travis@gzaripov.com "cd ~/optical-system-simulator/; git reset --hard HEAD; git pull origin master; yarn install; yarn build;"