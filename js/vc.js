var vc = {
	openConverters: new Array(),
	type: "list",
	templateConverting: function(){
		var html = '<div class="padSmall x100" id="wrap_{{id}}">';
		html += '<ul class="items">';
		html += '<li>';
		html += '<div class="header x30">Title</div> <span style="font-size:11px;" title="{{title}}" id="title_{{id}}">{{title|chop>25}}</span>';
		html += '</li>';
		html += '<li>';
		html += '<div class="header x30">Source Size</div> <span id="filesize_{{id}}">{{size|filesize}}</span>';
		html += '</li>';
		html += '<li>';
		html += '<div class="header x30">Speed</div> <span id="fps_{{id}}">{{fps}} fps</span>';
		html += '</li>';
		html += '<li>';
		html += '<div class="header x30">Frames</div> <span id="frames_{{id}}">{{frames}}</span>';
		html += '</li>';
		html += '<li>';
		html += '<div class="header x30">Remaining</div> <span id="timeleft_{{id}}">{{timeLeft|hhmmss}}</span>';
		html += '</li>';
		html += '<li>';
		html += '<div class="header x30">Progress</div> <span id="percent_{{id}}">{{if percent|more>100}}{{else}}{{percent}}{{/if}}%</span>';
		html += '</li>';
		html += '</ul>';
		html += '<div style="margin-top:5px;margin-bottom:10px;float:left;width:90%;margin-left:5%;margin-right:5%;">';
		html += '<div style="border:1px solid #9f9f9f;float:left;width:100%;">';
		html += '<div style="height:20px;width:{{if percent|more>100}}0{{else}}{{percent}}{{/if}}%;" id="percentBar_{{id}}" class="progressBar"></div>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		return html;
	},
	uploadInit: function(){
		$("#filez").html5_upload({
			url: function(number) {
				return "/xmlupload";
			},
			onStart: function(event, total) {
				$(".footerleft").animate({"width":"66%"},function(){
					$("#pr_c").fadeIn();
				});
				return true;
			},
			onFinish: function(event, total) {
				$("#pr_c").fadeOut(function(){
					$(".footerleft").animate({"width":"100%"});
				});
				$("#fileRemaining").fadeOut();
				$("#fileRemaining").html("");
			},
			onError: function(event, name, error) {
				alert(name+" : "+error);
			},
			onStartOne: function(event, name, number, total) {
				$('#uploadID'+number).addClass('process');
				return true;
			},
			onFinishOne: function(event, response, name, number, total) {
				$('#uploadID'+number).removeClass('process');
				$('#uploadID'+number).addClass('done');
			},
			onFiles: function(event, files){
				var html = "";
				for(var i = 0; i<files.length; i++){
					html += "<li id='uploadID"+i+"'>"+(files[i].name || files[i].fileName)+" [ "+Mark.pipes.filesize(files[i].size || files[i].fileSize)+" ]</li>";
				}
				$("#fileRemaining").html("<ul>"+html+"</ul>");
				$("#fileRemaining").css({"top":($("#footer").position().top-$("#footer").outerHeight()-$("#fileRemaining").outerHeight())+"px"});
				$("#fileRemaining").fadeIn();
				setTimeout(function(){
					$("#fileRemaining").fadeOut();
				},3000)
			},
			extraFields:{
				'user': user.name,
				'session': user.sessionID,
				'size': 'vp8',
				'subType': 'hard',
				'vid': 'webUpload'
			},
			setProgress: function(val) {
				$(".progress .bar").css({'width':Math.ceil(val*100)+"%"});
				$(".progress span").html("Uploading "+Math.ceil(val*100)+"%");
			},
		});
	},
	intervalStatus: 0,
	init: function(){
		vc.history();
		vc.status();
		vc.intervalUpdate();
	},
	upload: function(){
		ws.send({
			"request": "get",
			"page": "upload",
			"class":"Request"
		});
	},
	status: function(){
		ws.send({
			"request": "get",
			"page": "status",
			"class":"Request"
		});
	},
	history: function(){
		ws.send({
			"request": "get",
			"page": "history",
			"class":"Request",
			"data":{ 
				"historyPage":"1",
				"listType":vc.type
			}
		});
	},
	queue: function(){
		ws.send({
			"request": "get",
			"page": "queue",
			"class":"Request",
			"data":{ 
				"queuePage":"1",
				"listType":"list"
			}
		});
	},
	historyActionsPage: function(page){
		ws.send({
			"request": "get",
			"page": "history",
			"class":"Request",
			"data":{ 
				"historyPage":page,
				"listType":vc.type
			}
		});
	},
	queueActionsPage: function(page){
		ws.send({
			"request": "get",
			"page": "queue",
			"class":"Request",
			"data":{ 
				"queuePage":page,
				"listType":"list"
			}
		});
	},
	statusChange: function(callBack, msg){
		$("#historySize").html(msg.history.length);
		$("#uploadSize").html(msg.uploadQueue.length);
		$("#queueSize").html(msg.queue.length);
		var openIds = new Array();
		for(var x=0;x<msg.currents.length;x++){
			if($("#wrap_"+msg.currents[x].id).length){
				$("#filesize_"+msg.currents[x].id).html(Mark.pipes.filesize(msg.currents[x].size));
				$("#fps_"+msg.currents[x].id).html(msg.currents[x].fps+" fps");
				$("#frames_"+msg.currents[x].id).html(msg.currents[x].frames);
				if(msg.currents[x].percent<=100){
					$("#timeleft_"+msg.currents[x].id).html(Mark.pipes.hhmmss(msg.currents[x].timeLeft));
					$("#percentBar_"+msg.currents[x].id).css({"width":msg.currents[x].percent+"%"});
					$("#percent_"+msg.currents[x].id).html(msg.currents[x].percent+"%");
				}else{
					$("#timeleft_"+msg.currents[x].id).html("Unknown");
					$("#percentBar_"+msg.currents[x].id).css({"width":"0%"});
					$("#percent_"+msg.currents[x].id).html("0%");
				}
			}else{
				vc.openConverters.push(msg.currents[x].id);
				console.log(msg.currents[x]);
				$(".insertBeforeStatus").before(Mark.up(
					vc.templateConverting(),
					msg.currents[x]
				));
			}
			openIds.push(msg.currents[x].id);
		}
		for(var x=0;x<vc.openConverters.length;x++){
			if($.inArray(vc.openConverters[x],openIds)==-1){
				vc.hideStatusBox("#wrap_"+vc.openConverters[x]);
				delete(vc.openConverters[x]);
			}
		}
	},
	hideStatusBox: function(element){
		$(element).fadeOut(function(){
			$(element).empty();
			$(element).remove();
		});
	},
	intervalUpdate: function(){
		vc.intervalStatus = setInterval(function(){
			ws.send({
				"class":"Request",
				"data": {
					"status":1
				},
				"request":"get",
				"page":"status"
			});
		}, 1000);
	}
}
ws.addCallback(vc.statusChange,"status");