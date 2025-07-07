import {
	VoiceConnectionStatus,
	createAudioPlayer,
	createAudioResource,
	entersState,
	joinVoiceChannel,
} from "@discordjs/voice";
import {
	InteractionResponseType,
	InteractionType,
	verifyKeyMiddleware,
} from "discord-interactions";
import { Client, Events, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import express from "express";

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Audio file path
const pathToAudioFile = "./assets/donnie.mp3";

// Create Discord client for voice functionality
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
	],
});

// Store targets per server and active voice connections
const serverTargets = new Map(); // guildId -> userId
const activeConnections = new Map(); // guildId -> { connection, player }

// Target management functions
async function setTarget(guildId, userId) {
	serverTargets.set(guildId, userId);
}

async function getTarget(guildId) {
	return serverTargets.get(guildId);
}

async function removeTarget(guildId) {
	serverTargets.delete(guildId);
}

// Discord client event handlers
client.once(Events.ClientReady, () => {
	console.log(`Discord bot ready! Logged in as ${client.user.tag}`);
});

// Handle voice state updates (when users join/leave voice channels)
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
	const guildId = newState.guild.id;
	const userId = newState.member.id;
	const targetId = await getTarget(guildId);

	// Handle bot being moved/kicked from voice channel
	if (userId === client.user.id && targetId) {
		// Bot was kicked out of channel completely
		if (oldState.channelId && !newState.channelId) {
			console.log(`Bot was kicked from channel ${oldState.channelId}`);
			// Find where the target is and rejoin
			const targetGuildMember = await client.guilds.cache
				.get(guildId)
				.members.fetch(targetId)
				.catch(() => null);

			if (targetGuildMember?.voice?.channelId) {
				console.log(
					`Rejoining target in channel ${targetGuildMember.voice.channelId}`
				);
				await joinTargetChannel(
					guildId,
					targetGuildMember.voice.channelId
				);
			}
		}
		// Bot was moved to a different channel
		else if (
			oldState.channelId &&
			newState.channelId &&
			oldState.channelId !== newState.channelId
		) {
			console.log(
				`Bot was moved from ${oldState.channelId} to ${newState.channelId}`
			);
			// Find where the target is
			const targetGuildMember = await client.guilds.cache
				.get(guildId)
				.members.fetch(targetId)
				.catch(() => null);

			// If target is in a different channel than where bot was moved, rejoin target
			if (
				targetGuildMember?.voice?.channelId &&
				targetGuildMember.voice.channelId !== newState.channelId
			) {
				console.log(
					`Target is in ${targetGuildMember.voice.channelId}, rejoining target`
				);
				await leaveVoiceChannel(guildId);
				await joinTargetChannel(
					guildId,
					targetGuildMember.voice.channelId
				);
			}
		}
	}

	// Check if the user is our target
	if (userId !== targetId) return;

	// Target joined a voice channel
	if (!oldState.channelId && newState.channelId) {
		console.log(
			`Target ${userId} joined voice channel ${newState.channelId}`
		);
		await joinTargetChannel(guildId, newState.channelId);
	}
	// Target left a voice channel
	else if (oldState.channelId && !newState.channelId) {
		console.log(`Target ${userId} left voice channel`);
		await leaveVoiceChannel(guildId);
	}
	// Target switched channels
	else if (oldState.channelId !== newState.channelId && newState.channelId) {
		console.log(
			`Target ${userId} switched to channel ${newState.channelId}`
		);
		await leaveVoiceChannel(guildId);
		await joinTargetChannel(guildId, newState.channelId);
	}
});

// Handle speaking detection through voice receiver
function setupSpeakingDetection(guildId, connection) {
	const receiver = connection.receiver;

	receiver.speaking.on("start", async (userId) => {
		const targetId = await getTarget(guildId);
		if (userId === targetId) {
			playAudioFile(guildId);
		}
	});

	receiver.speaking.on("end", async (userId) => {
		const targetId = await getTarget(guildId);
		if (userId === targetId) {
			stopAudioFile(guildId);
		}
	});
}

async function joinTargetChannel(guildId, channelId) {
	try {
		const channel = client.channels.cache.get(channelId);
		if (!channel) return;

		const connection = joinVoiceChannel({
			channelId: channelId,
			guildId: guildId,
			adapterCreator: channel.guild.voiceAdapterCreator,
			selfDeaf: false,
			selfMute: false,
		});

		// Wait for the connection to be ready
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

		const player = createAudioPlayer();
		connection.subscribe(player);

		// Set up speaking detection
		setupSpeakingDetection(guildId, connection);

		activeConnections.set(guildId, { connection, player });
		console.log(`Joined voice channel ${channelId} in guild ${guildId}`);
	} catch (error) {
		console.error("Error joining voice channel:", error);
	}
}

async function leaveVoiceChannel(guildId) {
	const connectionData = activeConnections.get(guildId);
	if (connectionData) {
		connectionData.connection.destroy();
		activeConnections.delete(guildId);
		console.log(`Left voice channel in guild ${guildId}`);
	}
}

async function playAudioFile(guildId) {
	const connectionData = activeConnections.get(guildId);
	if (!connectionData) return;

	try {
		const audioFile = createAudioResource(pathToAudioFile);
		connectionData.player.play(audioFile);
	} catch (error) {
		console.error("Error playing audio file:", error);
	}
}

async function stopAudioFile(guildId) {
	const connectionData = activeConnections.get(guildId);
	if (connectionData) {
		connectionData.player.stop();
	}
}

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post(
	"/interactions",
	verifyKeyMiddleware(process.env.PUBLIC_KEY),
	async function (req, res) {
		// Interaction type and data
		const { type, id, data } = req.body;

		/**
		 * Handle verification requests
		 */
		if (type === InteractionType.PING) {
			return res.send({ type: InteractionResponseType.PONG });
		}

		/**
		 * Handle slash command requests
		 * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
		 */
		if (type === InteractionType.APPLICATION_COMMAND) {
			const { name } = data;
			const context = req.body.context;
			const userId =
				context === 0 ? req.body.member.user.id : req.body.user.id;
			const guildId = req.body.guild_id;

			// Target management commands
			if (name === "set-target") {
				const targetId = req.body.data.options[0].value;
				await setTarget(guildId, targetId);
				const targetGuildMember = await client.guilds.cache
					.get(guildId)
					.members.fetch(targetId)
					.catch(() => null);

				if (targetGuildMember?.voice?.channelId) {
					console.log(
						`Joining target in channel ${targetGuildMember.voice.channelId}`
					);
					await joinTargetChannel(
						guildId,
						targetGuildMember.voice.channelId
					);
				}

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: `🎯 Target set to <@${targetId}>! The bot will now follow them in voice channels.`,
						flags: 64, // Ephemeral
					},
				});
			}

			if (name === "remove-target") {
				const currentTarget = await getTarget(guildId);
				if (!currentTarget) {
					return res.send({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content:
								"❌ No target is currently set for this server.",
							flags: 64,
						},
					});
				}

				await removeTarget(guildId);
				await leaveVoiceChannel(guildId); // Leave any active voice channel

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: `✅ Target removed! The bot will no longer follow <@${currentTarget}>.`,
						flags: 64,
					},
				});
			}

			if (name === "current-target") {
				const currentTarget = await getTarget(guildId);
				if (!currentTarget) {
					return res.send({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content:
								"❌ No target is currently set for this server.",
							flags: 64,
						},
					});
				}

				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: `🎯 Current target: <@${currentTarget}>`,
						flags: 64,
					},
				});
			}

			if (name === "join-vc") {
				const currentTarget = await getTarget(guildId);
				if (!currentTarget) {
					return res.send({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content:
								"❌ No target is currently set for this server.",
							flags: 64,
						},
					});
				}
				const targetGuildMember = await client.guilds.cache
					.get(guildId)
					.members.fetch(currentTarget);
				const channelId = targetGuildMember.voice.channelId;
				if (!channelId) {
					return res.send({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content:
								"❌ Current target is not in a voice channel.",
							flags: 64,
						},
					});
				}

				await joinTargetChannel(guildId, channelId);
				return res.send({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: `✅ Joined voice channel <#${channelId}>`,
						flags: 64,
					},
				});
			}

			console.error(`unknown command: ${name}`);
			return res.status(400).json({ error: "unknown command" });
		}

		console.error("unknown interaction type", type);
		return res.status(400).json({ error: "unknown interaction type" });
	}
);

app.listen(PORT, () => {
	console.log("Listening on port", PORT);
});
