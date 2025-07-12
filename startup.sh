#!/bin/sh
# Function to log messages without exposing sensitive data
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if required environment variables are set
if [ -z "$DISCORD_TOKEN" ]; then
    log_message "ERROR: DISCORD_TOKEN environment variable is required"
    exit 1
fi

if [ -z "$NGROK_AUTHTOKEN" ]; then
    log_message "ERROR: NGROK_AUTHTOKEN environment variable is required"
    exit 1
fi

# Set ngrok auth token (redirecting output to prevent token exposure)
log_message "Configuring ngrok authentication..."
ngrok config add-authtoken "$NGROK_AUTHTOKEN" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    log_message "ERROR: Failed to configure ngrok authentication"
    exit 1
fi

# Start ngrok in background with custom domain if provided
log_message "Starting ngrok tunnel..."
if [ ! -z "$NGROK_SUBDOMAIN" ]; then
    # Use custom domain if provided
    ngrok http --url="$NGROK_SUBDOMAIN" 9000 > /dev/null 2>&1 &
    log_message "Using custom domain: $NGROK_SUBDOMAIN"
else
    # Use random ngrok domain
    ngrok http 9000 > /dev/null 2>&1 &
fi

NGROK_PID=$!

# Wait for ngrok to start and check if it's running
sleep 3

if ! kill -0 $NGROK_PID 2>/dev/null; then
    log_message "ERROR: ngrok failed to start"
    exit 1
fi

# Start the Discord bot
log_message "Starting Discord bot..."
npm start

# If npm start exits, clean up ngrok
log_message "Shutting down..."
kill $NGROK_PID 2>/dev/null
