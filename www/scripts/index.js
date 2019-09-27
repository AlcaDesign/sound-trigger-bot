const apiBase = location.origin;

let state = {};

// /**
//  * @prop {Element} toggleTTS
//  */
const elements = {
	/** @type {Element} */
	toggleTTS: document.getElementById('toggle-tts')
};

elements.toggleTTS.addEventListener('click', () => {
	ttsToggle();
});

getState().then(updateState);

function update() {
	elements.toggleTTS.querySelector('span').textContent =
		state.tts.enabled ? '✅' : '❌';
}

function updateState(_state) {
	state = _state;
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
	return api({ endpoint: 'state/tts/toggle', method: 'post' })
		.then(updateState);
}