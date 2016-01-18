/**
 * VAR
 */

var e = null;
var winWidth = screen.width;
var winHeigth = screen.height;

var iconsPosition = {
    notif: {
        x: winWidth - 60,
        y: winHeigth - 60
    },
    trash: {
        x: winWidth - 60,
        y: 60
    }
};

// tester si width et height sont plus grand...
var json;

var postIt = null;
var postItSelected = null;
var listPostIt = [];
var listDisplayedPostIt = [];

/**
 * FCT
 */

function convert(coo, axis) {
    "use strict";
    return ((2 * coo) / axis) -1;
}

function getIconPosition(){
    iconsPosition.notif.x = convert(iconsPosition.notif.x, winWidth);
    iconsPosition.notif.y = convert(iconsPosition.notif.y, winHeigth);
    iconsPosition.trash.x = convert(iconsPosition.trash.x, winWidth);
    iconsPosition.trash.y = convert(iconsPosition.trash.y, winHeigth);
    console.log(iconsPosition);
    return JSON.stringify(iconsPosition);
}

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

function openNotif() {
    "use strict";
    document.getElementById("importZone").style.display = "block";
    document.getElementById("notif").style.display = "none";
    document.getElementById("validate").style.display = "flex";
    for (e in listPostIt){
        displayPostIt(listPostIt[e]);
    }
    document.getElementById("notif").innerHTML = 0;
    listPostIt = [];
}

// validate the import
function validateImport() {
    "use strict";
    document.getElementById("importZone").style.display = "none";
    document.getElementById("notif").style.display = "flex";
    document.getElementById("validate").style.display = "none";
    for (e in listDisplayedPostIt){
        document.getElementById(listDisplayedPostIt[e].id).className = "postIt";
    }
}

function displayPostIt(p) {
    "use strict";
    postIt = document.createElement("div");
    postIt.innerHTML = p.content;
    postIt.setAttribute("id", p.id);
    postIt.setAttribute("class", "postIt imported");
    postIt.style.left = resize(p.x, winWidth);
    postIt.style.top = resize(p.y, winHeigth);
    // CAN I DO THAT ?
    postIt.onclick = "selectPostIt(p)";
    document.body.insertBefore(postIt, document.getElementById("buttons"));
    listDisplayedPostIt.push(p);
}

// select a postIt to edit it
function selectPostIt(p){
    postIt = document.getElementById(p.id);
    if(postIt.className.indexOf("selected") > -1){
        postIt.classList.remove(postIt.className.indexOf("selected"));
        postItSelected = null;
    } else {
        postIt.className += " selected";
        postItSelected = p;
    }
}

// edit a postIt position
function editPostIt(p) {
    "use strict";
    postIt = document.getElementById(p.id);
    postIt.innerHTML = p.content;
    postIt.style.left = resize(p.x, winWidth);
    postIt.style.top = resize(p.y, winHeigth);
}

// suppress a postIt
function destroyPostIt(p) {
    "use strict";
    postIt = document.getElementById(p.id);
    document.body.removeChild(postIt);
    listDisplayedPostIt.splice(listDisplayedPostIt.indexOf(p), 1);
}

// update
function update() {
    "use strict";

    var isAPostItSelected=false;
    for (e in json.postIt){
        // ajout postIt
        if (listPostIt.indexOf(json.postIt[e]) == -1){
            addToNotif(postIt[e]);
        }
        if(json.postIt[e].isSelected == true){
            if(postItSelected){
                editPostIt(json.postIt[e]);
            }
            else{
                selectPostIt(json.postIt[e]);
            }
            isAPostItSelected=true;
        }
    }
    if(postItSelected && !isAPostItSelected){
        selectPostIt(postItSelected);
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
        connection.send(getIconPosition());
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