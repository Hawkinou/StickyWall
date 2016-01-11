/**
 * VAR
 */

var e = null;
var winHeigth = screen.height;
var winWidth = screen.width;

var json;

var postIt = null;
var listPostIt;
var listDisplayedPostIt;

/**
 * FCT
 */

function resize(coo, axis) {
    "use strict";
    return ((coo * 1 + 1) * axis) / 2;
}

function editHand(r, l) {
    "use strict";
    var handR = document.getElementById("rightHand"),
        handL = document.getElementById("leftHand");
    handR.style.left = resize(r.x, winWidth);
    handR.style.top = resize((r.y * -1), winHeigth);
    handL.style.left = resize(l.x, winWidth);
    handL.style.top = resize((l.y * -1), winHeigth);
}

function addToNotif(p) {
    "use strict";
    document.getElementById("notif").innerHTML += 1;
    listPostIt.push(p);
}

function displayPostIt(p) {
    "use strict";
    postIt = document.createElement("div");
    postIt.innerHTML = p.content;
    postIt.setAttribute("id", p.id);
    postIt.setAttribute("class", "postIt imported");
    postIt.style.left = resize(p.x, winWidth);
    postIt.style.top = resize(p.y, winHeigth);
    document.body.insertBefore(postIt, document.getElementById("buttons"));
}

function editPostIt(p) {
    "use strict";
    postIt = document.getElementById(p.id);
    postIt.innerHTML = p.content;
    postIt.style.left = resize(p.x, winWidth);
    postIt.style.top = resize(p.y, winHeigth);
}

function destroyPostIt(p) {
    "use strict";
    postIt = document.getElementById(p.id);
    document.body.removeChild(postIt);
    listDisplayedPostIt.splice(listDisplayedPostIt.indexOf(p), 1);
    listPostIt.splice(listPostIt.indexOf(p), 1);
}

function openNotif() {
    "use strict";
    document.getElementById("importZone").style.display = "block";
    document.getElementById("notif").className += "validate";
    document.getElementById("notif").innerHTML = "OK";
}

function validateImport() {
    "use strict";
    document.getElementById("importZone").style.display = "none";
    document.getElementById("notif").classList.remove(document.getElementById("notif").classList.indexOf("validate"));
    document.getElementById("notif").innerHTML = 0;
}

function update() {
    "use strict";
    
    // ajout postIt 
    if (json.postIt.length > listPostIt.length){
        document.getElementById("notif").innerHTML = json.postIt.length - listPostIt.length;
        for (e in json.postIt){
            if (listPostIt.indexOf(json.postIt[e]) == -1){
                listPostIt.push(json.postIt[e]);
            }
        }
    }
    
    // suppression postIt
    if (json.postIt.length < listDisplayedPostIt.length){
        for (e in listDisplayedPostIt){
            if (listDisplayedPostIt.indexOf(json.postIt[e]) == -1){
                
            }
        }
    }
    
    // mettre a jour les mains
    editHand(json.rightHand, json.leftHand);
    
}

/**
 * WEB
 */

var connectionWs = function () {
    "use strict";
    
    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    var connection = new WebSocket('ws://127.0.0.1:8080');

    connection.onopen = function () {
        // connection is opened and ready to use
    };

    connection.onerror = function (error) {
        // an error occurred when sending/receiving data
    };

    connection.onmessage = function (message) {
        // try to decode json (I assume that each message from server is json)
        try {
            json = JSON.parse(message.data);
            update();
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
        // handle incoming message
    };
};

function start() {
    "use strict";
    connectionWs();
}