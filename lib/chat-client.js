require('dotenv').config();
const fs = require('fs').promises;
const tmi = require('tmi.js');

const events = require('./events');

// const soundEffects = require('../db.json').sounds;
let dbCache = {
	lastCached: -Infinity,
	data: {}
};

async function getDB() {
	const now = Date.now();
	if(dbCache.lastCached + 10000 > now) {
		return dbCache.data;
	}
	let data;
	try {
		const json = await fs.readFile('./db.json');
		data = JSON.parse(json);
	} catch(err) {
		console.log(err);
		return { sounds: [] };
	}
	dbCache.lastCached = now;
	return dbCache.data = data;
}

async function getSoundEffects() {
	const db = await getDB();
	return db.sounds;
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
		n => n.name === command || n.aliases.includes(command)
	);
	if(soundEffect) {
		events.emit('sfx', { command, soundEffect });
	}
	else if(command === 'tts') {
		events.emit('tts', { text: args.join(' ') });
	}
}