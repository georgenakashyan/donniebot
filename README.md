# **Donnie Thornberry Bot**

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/212yg.svg)](https://uptime.betterstack.com/?utm_source=status_badge)

A Discord bot inspired by [aaronr5tv's Donnie ThornberryBot](https://github.com/aaronr5tv/DonnieThornberryBot) that joins voice channels and plays Donnie Thornberry's iconic screaming sounds to prank friends in your Discord server.

## Features

- **Target System**: Set specific users as targets for the bot to follow
- **Voice Channel Integration**: Automatically joins voice channels where targets are present
- **Audio Playback**: Plays authentic Donnie Thornberry screaming sounds
- **Server-specific Targeting**: Each Discord server can have its own target

## Commands

- `/set-target <user>` - Set a user as Donnie's target
- `/current-target` - View the current target for this server
- `/remove-target` - Remove the current target
- `/join-vc` - Make Donnie join your current voice channel

## Quick Start

### Option 1: Invite the Bot

[Invite DonnieBot to your Discord server](https://discord.com/oauth2/authorize?client_id=1391512774001164308)

### Option 2: Self-Host

#### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Discord Developer Application](https://discord.com/developers/applications)

#### Required Bot Permissions

- `applications.commands` (Slash Commands)
- `bot` with:
  - Send Messages
  - Connect (Voice)
  - Speak (Voice)

#### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/georgenakashyan/DonnieBot.git
   cd DonnieBot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Discord bot credentials:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   APP_ID=your_application_id_here
   PUBLIC_KEY=your_public_key_here
   ```

4. Register slash commands:
   ```bash
   npm run register
   ```

5. Start the bot:
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

#### Setting up Interactions Endpoint (for self-hosting)

If self-hosting, you'll need to set up a public endpoint for Discord interactions:

1. Install and start ngrok:
   ```bash
   ngrok http 9000
   ```

2. Copy the HTTPS forwarding URL (e.g., `https://1234-example.ngrok.io`)

3. In your [Discord Developer Portal](https://discord.com/developers/applications):
   - Go to your application's **General Information** tab
   - Set **Interactions Endpoint URL** to: `https://your-ngrok-url.ngrok.io/interactions`
   - Save changes

## Project Structure

```
DonnieBot/
├── src/
│   ├── app.js          # Main bot application
│   ├── commands.js     # Slash command definitions
│   └── utils.js        # Utility functions
├── assets/
│   ├── donnie.mp3      # Donnie's screaming audio
│   └── pfp.jpeg        # Bot profile picture
├── scripts/
│   └── startup.sh      # Deployment script
└── package.json        # Dependencies & scripts
```

## How It Works

1. Use `/set-target` to designate a user as the target
2. When the target joins a voice channel, DonnieBot automatically joins too
3. The bot plays Donnie Thornberry screaming sounds to create a fun (chaotic) experience
4. Use `/remove-target` to stop the targeting

## Contributing

Feel free to submit issues and pull requests to improve the bot!

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- Original concept by [aaronr5tv](https://github.com/aaronr5tv/DonnieThornberryBot)
- Audio clips from "The Wild Thornberrys" animated series
