const sfxBase = 'sound-effects/';
const ttsBase = 'https://api.streamelements.com/kappa/v2/speech';

const chirp = sfxBase + 'tng_chirp_clean.mp3';

const soundCache = new Map();
const events = new EventEmitter();
const queue = {
	isPlaying: false,
	list: []
};

const audioCtx = new AudioContext();

async function loadSound(location, dontCache = false) {
	if(!dontCache) {
		const sound = soundCache.get(location);
		if(sound) {
			return sound;
		}
	}
	let audioBuf;
	try {
		const res = await fetch(location);
		const arrayBuf = await res.arrayBuffer();
		audioBuf = await audioCtx.decodeAudioData(arrayBuf);
	} catch {
		console.error(`Failed to load sound at: "${location}"`);
	}
	if(!dontCache) {
		soundCache.set(location, audioBuf);
	}
	return audioBuf;
}

function loadSoundNoCache(location) {
	return loadSound(location, true);
}

function playSound(audioBuf) {
	return new Promise((resolve, reject) => {
		const source = audioCtx.createBufferSource();
		source.buffer = audioBuf;
		source.connect(audioCtx.destination);
		source.start(audioCtx.currentTime);
		source.onended = resolve;
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

async function addToQueue(...items) {
	for(const [ i, n ] of items.entries()) {
		if(typeof n === 'string') {
			items[i] = await loadSound(n);
		}
	}
	queue.list.push({ items });
	playQueue();
}

socket.on('tts', async ({ text }) => {
	const qs = new URLSearchParams({
		voice: 'Salli',
		text
	});
	addToQueue(
		chirp,
		await loadSoundNoCache(`${ttsBase}?${qs}`)
	);
});

socket.on('sfx', ({ command, soundEffect }) => {
	const { file } = soundEffect;
	addToQueue(sfxBase + file);
});