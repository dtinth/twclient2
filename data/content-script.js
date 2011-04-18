
var Connection;

(function() {

	var nextID = 1;
	var connections = {};

	onMessage = function onMessage(message) {
		if (connections[message.id]) {
			connections[message.id].onmessage(message.data);
		}
	};

	Connection = function Connection() {
		var that = {};
		var id = nextID++;
		that.postMessage = function(message) {
			postMessage({
				id: id,
				data: message
			});
		};
		that.onmessage = function(message) {
		};
		that.disconnect = function() {
			delete connections[id];
		};
		connections[id] = that;
		return that;
	};

})();

window.thaiWitterClientVersion = '6';

window.thaiWitterClientEcho = function(str, cb) {
	var data = JSON.parse(str.substr(5));
	var conn = Connection();
	conn.onmessage = function(message) {
		conn.disconnect();
		cb(message);
	};
	conn.postMessage({ kind: 'echo', data: data });
};

window.thaiWitterClientStream = function(url, cb, hung) {
	var conn = Connection();
	conn.onmessage = function(message) {
		if (message.kind == 'data') {
			cb(message.data);
		} else if (message.kind == 'close') {
			hung();
			conn.disconnect();
		}
	};
	conn.postMessage({ kind: 'stream', url: url });
	return function() {
		conn.postMessage({ kind: 'abortStream' });
	};
};

if (!window.platform) {
	window.platform = {};
}

if (!window.platform.showNotification) {
	window.platform.showNotification = function(title, text) {
		var conn = Connection();
		conn.postMessage({ kind: 'notify', title: title, text: text });
		conn.disconnect();
	};
}

if (!window.platform.openURI) {
	window.platform.openURI = function(uri) {
		var conn = Connection();
		conn.postMessage({ kind: 'uri', uri: uri });
		conn.disconnect();
	};
}
