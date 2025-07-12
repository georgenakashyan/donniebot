#!/bin/bash
cd /root/DonnieBot
git pull origin main
npm run start
ngrok http --url="$NGROK_SUBDOMAIN" 9000 > /dev/null 2>&1 &