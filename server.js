require('dotenv').config();
const express = require('express');
const socketIO = require('socket.io');

const { getSoundEffects, state } = require('./lib/config');
const events = require('./lib/events');
const chat = require('./lib/chat-client');

const app = express();
const server = app.listen(process.env.HTTP_PORT, () => {
	console.log('Listening :' + server.address().port);
});
const io = socketIO(server);

app.use(express.static('www', { extensions: [ 'html' ] }));


app.get('/api/sounds/list', async (req, res) => {
	const sounds = await getSoundEffects();
	res.json({ sounds });
});

app.get('/api/state', (req, res) => {
	res.json(state);
});

app.post('/api/state/tts/toggle', (req, res) => {
	state.tts.enabled = !state.tts.enabled;
	res.json(state);
	updateState();
});

app.use((req, res, next) => {
	res.sendStatus(404);
});

app.use((err, req, res, next) => {
	console.error(err);
	res.sendStatus(500);
});

io.on('connection', socket => {
	console.log('Client connected');

	socket.on('disconnect', () => {
		console.log('Client disconnected');
	});
});

events.on('sfx', (...args) => io.emit('sfx', ...args));
events.on('tts', (...args) => io.emit('tts', ...args));

function updateState() {
	io.emit('state', state);
}

io.on('connect', socket => {
	socket.on('toggle-tts', () => {
		state.tts.enabled = !state.tts.enabled;
		updateState();
	});
});