const apiBase = location.origin;
const elements = {
	/** @type {Element} */
	toggleTTS: document.getElementById('toggle-tts')
};
const state = {};

socket.on('state', updateState);

elements.toggleTTS.addEventListener('click', () => {
	ttsToggle();
});

getState().then(updateState);

function update() {
	const { toggleTTS } = elements;
	const { tts } = state;
	toggleTTS.querySelector('span').textContent = tts.enabled ? '✅' : '❌';
}

function updateState(_state) {
	Object.assign(state, _state);
	update();
}

function request({ url = '', qs = {}, method = 'get', headers = {} } = {}) {
	url += new URLSearchParams(qs);
	return fetch(url, { headers, method });
}

function api({ endpoint = '', qs, method }) {
	const url = `${apiBase}/api/${endpoint}`;
	return request({ url, qs, method })
	.then(res => res.json());
}

function getState() {
	return api({ endpoint: 'state' });
}

function ttsToggle() {
	socket.emit('toggle-tts');
	// return api({ endpoint: 'state/tts/toggle', method: 'post' })
	// 	.then(updateState);
}