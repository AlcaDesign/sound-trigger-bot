const chirp = new Audio(
	'http://www.trekcore.com/audio/communicator/tng_chirp_clean.mp3'
);

const events = new EventEmitter();

const queue = {
	isPlaying: false,
	list: []
};

function playSound(file) {
	/** @type {HTMLAudioElement} */
	let audio;
	if(file instanceof Audio === false) {
		audio = new Audio(file);
	}
	else {
		audio = file;
	}
	return new Promise((resolve, reject) => {
		audio.onended = resolve;
		audio.play();
	});
}

async function playQueue() {
	if(!queue.list.length) {
		return;
	}
	else if(queue.isPlaying) {
		return once(events, 'queue-next').then(playQueue);
	}
	queue.isPlaying = true;
	const listItem = queue.list.shift();
	for(const item of listItem.items) {
		await playSound(item);
	}
	queue.isPlaying = false;
	events.emit('queue-next');
}

function addToQueue(...items) {
	queue.list.push({ items });
	playQueue();
}

socket.on('tts', ({ text }) => {
	const qs = new URLSearchParams({
		voice: 'Salli',
		text
	});
	addToQueue(
		chirp,
		`https://api.streamelements.com/kappa/v2/speech?${qs}`
	);
});

socket.on('sfx', ({ command, soundEffect }) => {
	const { file } = soundEffect;
	addToQueue(`sound-effects/${file}`);
});