import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";

// Simple test command
const SET_TARGET_COMMAND = {
	name: "set-target",
	description: "Set Donnie's target",
	options: [
		{
			type: 6,
			name: "target",
			description: "Who to target",
			required: true,
		},
	],
	type: 1,
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

const REMOVE_TARGET_COMMAND = {
	name: "remove-target",
	description: "Remove Donnie's target",
	type: 1,
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

const CURRENT_TARGET_COMMAND = {
	name: "current-target",
	description: "View Donnie's current target",
	type: 1,
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

const ALL_COMMANDS = [
	SET_TARGET_COMMAND,
	REMOVE_TARGET_COMMAND,
	CURRENT_TARGET_COMMAND,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
