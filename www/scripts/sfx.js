const sfxBase = 'sound-effects/';
const ttsBase = 'https://api.streamelements.com/kappa/v2/speech';

const chirp = sfxBase + 'tng_chirp_clean.mp3';

let soundsPlayed = [];
const soundCache = new Map();
const events = new EventEmitter();
const queue = {
	isPlaying: false,
	list: []
};

const audioCtx = new AudioContext();
const audioGain = audioCtx.createGain();
audioGain.gain.value = 1;
audioGain.connect(audioCtx.destination);

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
		return null;
	}
	if(!dontCache) {
		soundCache.set(location, audioBuf);
	}
	return audioBuf;
}

function loadSoundNoCache(location) {
	return loadSound(location, true);
}

function playSound(audio) {
	return new Promise((resolve, reject) => {
		if(!audio) return resolve();
		const source = audioCtx.createBufferSource();
		source.buffer = audio.buffer;
		audioGain.gain.value = audio.volume || 1;
		source.connect(audioGain);
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
		if(n instanceof AudioBuffer === false) {
			const isString = typeof n === 'string';
			const name = isString ? n : n.location;
			items[i] = {
				buffer: await loadSound(name),
				volume: isString ? 1 : n.volume || 1
			};
		}
		else {
			items[i] = { buffer: n, volume: 1 };
		}
	}
	queue.list.push({ items });
	playQueue();
}

socket.on('tts', async ({ text }) => {
	const qs = new URLSearchParams({
		voice: 'Zhiyu',
		text
	});
	addToQueue(
		{ location: chirp, volume: 0.4 },
		await loadSoundNoCache(`${ttsBase}?${qs}`)
	);
});

socket.on('sfx', ({ command, soundEffect }) => {
	const { files } = soundEffect;
	let file;
	if(files.length > 1) {
		const filteredFiles = files.filter(n => !soundsPlayed.includes(n));
		const list = filteredFiles.length ?
			filteredFiles :
			files.filter(n => n !== soundsPlayed[soundsPlayed.length - 1]);
		file = list[Math.floor(Math.random() * list.length)];
	}
	else {
		file = files[0];
	}
	const isString = typeof file === 'string';
	let name = isString ? file : file.name;
	soundsPlayed = soundsPlayed.slice(-2);
	if(!soundsPlayed.includes(name)) {
		soundsPlayed.push(name);
	}
	const location = sfxBase + name;
	const volume = isString ? 1 : file.volume || 1;
	addToQueue({ location, volume });
});