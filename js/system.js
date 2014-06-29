$(document).ready(function(){
	ws.connect();

});
Mark.pipes.nl2br = function (str, n) {
    return str.replace(/\n/g, '<br />');
};
Mark.pipes.htmlescape = function (string) {
    return string.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/\'/g, '&#39;');
};
Mark.pipes.hhmmss = function (string) {
    var sec_num = parseInt(string, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
};
Mark.pipes.filesize = function (string) {
    return filesize(string);
};
Mark.pipes.isString = function (obj) {
    if( typeof obj === 'string' ) {
        return true;
    }else{
        return false;
    }
};
Mark.pipes.uuid = function (obj) {
    return user.sessionID;
};
Mark.pipes.user = function (obj) {
    return user.name;
};

ws.addCallback(template.msg,"recieve");
ws.addCallback(javascript.msg,"recieve");

ws.addCallback(template.ws_lost,"close");
//ws.addCallback(user.dashboard,"dashboard");
var system = {
	alert: function(text,extra){
		$.jGrowl(text,extra);
	},
	connected: function(){
		setInterval(function(){
			var data = {
				"request":"get",
				"page":"ping",
				"class":"Request"
			}
			ws.send(data);
		},30000);
	},
	loadDefault: function(){
		console.log('loading default');
		var rSent = false;
		$.each( system.defaults , function(key,val){
			if((_.contains(user.flags,val.flag) || val.flag == "") && !rSent){
				if(val.resume){
					if(template.onPage==""){
						if(window.location.hash.split("/").length==3){
							ws.send(jQuery.parseJSON(window.atob(window.location.hash.split("/")[2])));
							rSent = true;
						}
					}
				}else{
					ws.send(val.request);
					rSent = true;
				}
			}
		});
	},
	cache: true,
	defaults: [
		{
			"flag":"",
			"resume":true
		},
		{
			"flag":"r",
			"request": {
				"request": "get",
				"page": "history",
				"class": "Request",
				"data": {
					"historyPage": "1"
				}
			}
		},
		{
			"flag":"",
			"request": {
				"request": "get",
				"page": "login",
				"class": "Request"
			}
		}
	]
}
$.jGrowl.defaults.animateOpen = {
	height: 'show'
};