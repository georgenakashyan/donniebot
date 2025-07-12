#!/bin/bash
cd /root/DonnieBot
git pull origin main
/root/.bun/bin/bun install
sudo systemctl restart DonnieBot