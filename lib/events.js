const { EventEmitter, once } = require('events');

const events = new EventEmitter();
events.at = eventName => once(events, eventName);

module.exports = events;