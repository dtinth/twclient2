
var {Cc, Ci, Cu, Cr}          = require("chrome");
var {setTimeout, setInterval} = require("timer");

function stream(options) {

	var chan;
	var buffer;
	var timeout;
	var interval;
	var hungup = false;

	function isSafe() {
		var re = /^https?:\/\//i;
		return re.test(options.url);
	}

	function onDataAvailable(req, ctx, istream, offset, count) {
		var sstream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
		sstream.init(istream);
		buffer += sstream.read(count);
		keepAlive();
		flushBuffer();
	}

	function flushBuffer() {
		var data, newLine;
		while (-1 != (newLine = buffer.indexOf('\n'))) {
			data = buffer.substr(0, newLine);
			buffer = buffer.substr(newLine + 1);
			try { options.onData(data); } catch (e) {};
		}
	}

	function keepAlive() {
		timeout = new Date().getTime() + 90000;
	}

	function checkAlive() {
		if (new Date().getTime() > timeout) {
			hangup ();
		}
	}

	function hangup() {
		if (!hungup) {
			hungup = true;
			options.onClose();
			clearInterval(interval);
			chan.cancel(Cr.NS_BINDING_ABORTED);
		}
	}

	function initiateStream() {
		var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
		chan    = ios.newChannel(options.url, null, null);
		buffer  = '';
		keepAlive();
		chan.asyncOpen({
			onDataAvailable: onDataAvailable,
			onStartRequest: function(req, ctx) {},
			onStopRequest: function(req, ctx, status) { hangup(); }
		}, null);
		interval = setInterval(checkAlive, 2500);
	}

	if (!isSafe()) {
		return;
	}

	initiateStream();

	return hangup;

}

exports.stream = stream;

