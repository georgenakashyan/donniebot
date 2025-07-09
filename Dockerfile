# Uses node
FROM node:current-alpine3.22

# Goes to the app directory (think of it like a cd terminal command)
WORKDIR /app

# Install ngrok
RUN apk add --no-cache wget unzip && \
    wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz && \
    tar -xzf ngrok-v3-stable-linux-amd64.tgz && \
    mv ngrok /usr/local/bin/ && \
    chmod +x /usr/local/bin/ngrok && \
    rm ngrok-v3-stable-linux-amd64.tgz

# Copy package.json and package-lock.json (if available)
COPY package*json ./

# Install app dependencies
RUN npm install

#Copy the rest of our app into the container
COPY . .

# Copy startup script
COPY startup.sh ./
RUN chmod +x startup.sh

# Expose port
EXPOSE 9000

# Run the app
CMD ["./startup.sh"]