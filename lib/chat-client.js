require('dotenv').config();
const tmi = require('tmi.js');

const { readConfig } = require('./config');
const events = require('./events');

// const soundEffects = require('../db.json').sounds;
let dbCache = {
	lastCached: -Infinity,
	data: {}
};

async function getSoundEffects() {
	const config = await readConfig();
	return config.sounds;
}

/** @type {import("tmi.js").Client} */
const client = new tmi.Client({
	options: {
		debug: true
	},
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: process.env.TMI_USER || undefined,
		password: process.env.TMI_PASS || undefined
	},
	channels: process.env.TMI_CHANNELS
		.trim()
		.split(',')
		.reduce((p, n) => n.trim() ? p.concat(n.trim()) : p, [])
});

client.connect();

client.on('message', onMessageHandler);

client.on('timeout', onTimeoutHandler);
client.on('ban', onBanHandler);

/**
 * @param {string} channel
 * @param {import("tmi.js").ChatUserstate} tags
 * @param {string} message
 * @param {boolean} self
 */
async function onMessageHandler(channel, tags, message, self) {
	if(self || !message.startsWith('!')) {
		return;
	}
	const args = message.slice(1).split(' ');
	const command = args.shift().toLowerCase();
	const sounds = await getSoundEffects();
	const soundEffect = sounds.find(
		n => (n.name === command ||
			n.aliases.includes(command)) &&
			(!n.events || n.events.includes('sfx'))
	);
	if(soundEffect) {
		events.emit('sfx', { command, soundEffect });
	}
	else if(command === 'tts') {
		events.emit('tts', { text: args.join(' ') });
	}
	else if(command === 'sfx') {
		const sfxList = sounds.map(n => n.name).join(', ');
		client.say(channel, `List of sound effects: ${sfxList}`);
	}
}

async function onTimeoutHandler(channel, username, reason, tags) {
	const sounds = await getSoundEffects();
	const name = 'timeout';
	const soundEffect = sounds.find(n =>
		n.name === name && n.events && n.events.includes(name)
	);
	events.emit('sfx', { command: null, soundEffect });
}

async function onBanHandler(channel, username, reason, tags) {
	const sounds = await getSoundEffects();
	const name = 'ban';
	const soundEffect = sounds.find(n =>
		n.name === name && n.events && n.events.includes(name)
	);
	events.emit('sfx', { command: null, soundEffect });
}