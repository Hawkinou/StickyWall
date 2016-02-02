var http = require('http');
var webSocketServer = require('websocket').server;
var url = require('url');
var textejson='{"rightHand" :{"x" : 1,"y" : 1},"leftHand" :{"x" : -1,"y" : -1},"postIt" :[]}';
var jsonObject = JSON.parse(textejson);
var hand = true; // Main droite = true Main gauche false
var postItSelected=-1; //Numero du PostIt selectionné
var connection; // Si on est connecté en WS avec un client
var inSelection=false; //Si on est dans l'état selectionné
var idNumber=-1;
var notif={};
var trash={};
var server = http.createServer(function(req, res) {
	var page = url.parse(req.url).pathname;
	if (page=='/'){

	}
	else if(page=='/newPost'){
		var body;
		req.on('data', function (chunk) {
			body = chunk;
		});
		req.on('end', function () {
			console.log('POSTed: ' + body);
			createPostIt(""+body);
		});
	}
	else if(page=='/favicon.ico');
	else{
		var handValue=getHandPosition(page);
		console.log(page);
		console.log(handValue[1]+"/"+handValue[2]+"/"+handValue[3]+"/"+handValue[4]);
		jsonObject.rightHand.x=handValue[1];
		jsonObject.rightHand.y=handValue[2];
		jsonObject.leftHand.x=handValue[3];
		jsonObject.leftHand.y=handValue[4];
		if (postItSelected>-1){
			jsonObject.postIt[postItSelected].x=handValue[1];
			jsonObject.postIt[postItSelected].y=handValue[2];
		}
		if (Math.abs(handValue[1]*1-handValue[3]*1)<=0.15&&Math.abs(handValue[2]*1-handValue[4]*1)<=0.15){
			if (inSelection){

			}
			else if (postItSelected!=-1){
				jsonObject.postIt[postItSelected].isSelected=false;
				postItSelected=-1;
				inSelection=true;
			}
			else {
				if (getSelectedPostIt(handValue));
				else{
					isNotifSelected(handValue);
				}
				if (postItSelected!=-1)
					inSelection=true;
			}
		}
		else{
			inSelection=false;
		}

		if (connection) {
			jsonObject.notif = false;
			connection.sendUTF(JSON.stringify(jsonObject));
		}
		res.end();
	}
});

var wsServer = new webSocketServer({
	// WebSocket server is tied to a HTTP server. WebSocket request is just
	// an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
	httpServer: server
});
wsServer.on('request', function(request) {
	console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

	// accept connection - you should check 'request.origin' to make sure that
	// client is connecting from your website
	// (http://en.wikipedia.org/wiki/Same_origin_policy)
	connection = request.accept(null, request.origin);
	console.log((new Date()) + ' Connection accepted.');
	connection.sendUTF(JSON.stringify( jsonObject ));

	// user disconnected
	connection.on('close', function(connection) {
		console.log((new Date()) + " Peer "
		+ connection.remoteAddress + " disconnected.");
	});
	connection.on('message', function(message) {
		var info2 = message.utf8Data.replace(/\\/g, '');
		console.log(info2.substring(1,info2.length-1));

		var info = JSON.parse(info2.substring(1,info2.length-1));
		console.log(info);
		notif.x=info.notif.x;
		trash.x=info.trash.x;
		notif.y=info.notif.y;
		trash.y=info.trash.y;

	});
});
var getSelectedPostIt= function(handValue){
	if(hand){
		function coord(element, index, array) {
			if (handValue[1]>=element.x-0.1&&handValue[1]<=element.x*1+element.width*1){
				if ((handValue[2]*-1>=element.y-0.1&&handValue[2]*-1<=element.y*1+element.height*1)||(handValue[2]>=element.y-0.1&&handValue[2]<element.y*1+element.height*1)){
					postItSelected=index;
					jsonObject.postIt[postItSelected].isSelected=true;
					console.log("PostItSelected");
					return true;
				}
			}
		}
		jsonObject.postIt.forEach(coord);
		return false;
	}
	else{
	}
};
var getHandPosition = function(url) {
	var listCoord=url.split("/");
	var handValue=[];
	function coord(element, index, array) {
		handValue[index]=smooth(element.replace(",","."));
	}
	listCoord.forEach(coord);
	return handValue;
};
var isNotifSelected = function(handValue){
	if (notif.x) {
		if (handValue[1] >= notif.x) {
			if (handValue[2] * -1 >= notif.y) {
				jsonObject.notif = true;
				connection.sendUTF(JSON.stringify(jsonObject));
				inSelection=true;
			}
		}
	}
};
var createPostIt = function(data) {
	idNumber++;
	var postIt={};
	postIt.content=data;
	postIt.x=Math.random()-0.5;
	postIt.y=Math.random()-0.5;
	postIt.width=0.2;
	postIt.height=0.2;
	postIt.isSelected=false;
	postIt.id=idNumber;
	postIt.color="coral";
	jsonObject.postIt.push(postIt)
};
var smooth = function(x){
	if (x<-0.6){
		return 2*x+0.6;
	}
	else if (x>0.6){
		return 2*x-0.6;
	}
	return x;
}
server.listen(8080);
