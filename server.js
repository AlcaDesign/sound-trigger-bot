require('dotenv').config();
const express = require('express');
const socketIO = require('socket.io');

const events = require('./lib/events');
const chat = require('./lib/chat-client');

const app = express();
const server = app.listen(process.env.HTTP_PORT, () => {
	console.log('Listening :' + server.address().port);
});
const io = socketIO(server);

app.use(express.static('www', { extensions: [ 'html' ] }));

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