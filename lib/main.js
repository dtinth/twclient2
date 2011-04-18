
var pageMod = require("page-mod");
var tabs    = require("tabs");
var data    = require("self").data;
var twpage  = require("twpage");

pageMod.PageMod({

	include: [
		"http://dev.tw.dt.in.th/thaiWitter/*",
		"https://dev.tw.dt.in.th/thaiWitter/*",
		"http://tw.dt.in.th/thaiWitter/*",
		"https://tw.dt.in.th/thaiWitter/*"
	],

	contentScriptWhen: "ready",
	contentScriptFile: data.url('content-script.js'),

	onAttach: function onAttach(worker) {
		worker.on('message', twpage.Handler(worker, worker.tab));
	}

});
