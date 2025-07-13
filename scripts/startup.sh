#!/bin/bash

# Navigate to project directory
cd /root/donniebot

# Set NODE_ENV if not set
export NODE_ENV=production

# Start the bot
echo "Starting DonnieBot..."
npm run start