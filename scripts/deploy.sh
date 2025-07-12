#!/bin/bash
cd /root/DonnieBot
git pull origin main
docker build -t donnie-bot .