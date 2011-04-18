
var twstream      = require("twstream");
var request       = require("request");
var notifications = require("notifications");
var tabs          = require("tabs");
var data          = require("self").data;

function Handler(worker, tab) {

	function onMessage(message) {
		var id   = message.id;
		var data = message.data;
		if (data.kind == 'echo') {
			echo(id, data.data);
		} else if (data.kind == 'stream') {
			stream(id, data.url);
		} else if (data.kind == 'notify') {
			notify(data.title, data.text);
		} else if (data.kind == 'uri') {
			tabs.open(data.uri);
		}
	}

	function reply(id, message) {
		worker.postMessage({
			id:   id,
			data: message
		});
	}

	function echo(id, data) {
		var method = 'get', options = {
			url: data.endpoint,
			onComplete: function(response) {
				reply(id, response.text);
			}
		};
		if (data.data != null) {
			method = 'post';
			options.content = data.data;
		}
		request.Request(options)[method]();
	}

	function stream(id, url) {
		twstream.stream({
			onClose: function() {
				reply(id, { kind: 'close' });
				conn.disconnect();
			},
			onData: function(data) {
				reply(id, { kind: 'data', data: data });
			},
			url: url
		});
	}

	function notify(title, text) {
		notifications.notify({
			title: title,
			text: text,
			iconURL: data.url('thaiWitter-Small.png'),
			onClick: function() {
				// tab.activate(); #not working!!
			}
		});
	}

	return onMessage;

}

exports.Handler = Handler;

