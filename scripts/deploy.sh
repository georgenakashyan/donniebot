#!/bin/bash

echo "Starting deployment..."

# Stop the service first
sudo systemctl stop donniebot

# Navigate to project directory
cd /root/donniebot

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm install

# Start the service
echo "Starting donniebot service..."
sudo systemctl start donniebot

# Check if service started successfully
sleep 5
if sudo systemctl is-active --quiet donniebot; then
    echo "✅ Donniebot service started successfully"
else
    echo "❌ Failed to start donniebot service"
    sudo systemctl status donniebot
    exit 1
fi

echo "Deployment completed!"