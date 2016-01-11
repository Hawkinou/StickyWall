var http = require('http');
var webSocketServer = require('websocket').server;
var url = require('url');
var textejson='{"rightHand" :{"x" : 1,"y" : 1},"leftHand" :{"x" : -1,"y" : -1},"postIt" :[]}';
var jsonObject = JSON.parse(textejson);
var hand = true // Main droite = true Main gauche false
var postItSelected;
var connection;
var inSelection=false;
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
		jsonObject.rightHand.x=handValue[1];
		jsonObject.rightHand.y=handValue[2];
		jsonObject.leftHand.x=handValue[3];
		jsonObject.leftHand.y=handValue[4];
		if (postItSelected){
			jsonObject.postIt[postItSelected].x=handValue[1];
			jsonObject.postIt[postItSelected].y=handValue[2];
		}
		if (Math.abs(handValue[1]*1-handValue[3]*1)<0.15&&Math.abs(handValue[2]*1-handValue[4]*1)<0.15&&inSelection){
			if (postItSelected){
				postItSelected=undefined;
			}
			else {
				getSelectedPostIt(handValue);
			}
			inSelection=true;
		}
		else{
			inSelection=false;
		}
		if (connection)
			connection.sendUTF(JSON.stringify( jsonObject ));
		console.log(JSON.stringify( jsonObject ));
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

});
var getSelectedPostIt= function(handValue){
	if(hand){
		function coord(element, index, array) {
			if (handValue[1]>element.x&&handValue[1]<element.x+element.width){
				if (handValue[2]>element.y&&handValue[2]<element.y+element.height){
					postItSelected=index;
				}
			}
		}
		jsonObject.postIt.forEach(coord);
	}
	else{

	}
}
var getHandPosition = function(url) {
	var listCoord=url.split("/");
	var handValue=[];
	function coord(element, index, array) {
		handValue[index]=element.replace(",",".");
	}
	listCoord.forEach(coord);
	return handValue;
};
var createPostIt = function(data) {
	var postIt={};
	postIt.content=data;
	postIt.x=0;
	postIt.y=0;
	postIt.width=-0.2;
	postIt.height=0.2;
	jsonObject.postIt.push(postIt)
};
server.listen(8080);
