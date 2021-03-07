import { Stage } from './models/Game';
import { Pair } from './models/utils';

var stage = null;
var view = null;
var interval = null;
var credentials = { "username": "", "password": "" };
var lastKey = [];
var mousePos = null;
var debugDiv = null;
var DEBUG_MODE = true;
const FRAMES_PER_SECOND = 60;
function setupGame() {
	stage = new Stage(document.getElementById('stage'));

	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', () => moveByKey(event, false));
	document.addEventListener('keyup', () => moveByKey(event, true))
	stage.canvas.addEventListener('mousemove', function (evt) {
		mousePos = getMousePos(stage.canvas, evt);
	});
}
function startGame() {
	interval = setInterval(function () { 
		stage.step();
		stage.draw();
		// debug info
		if (DEBUG_MODE) {
			var mPos = mousePos !== null ? new Pair(mousePos.x, mousePos.y) : new Pair(NaN, NaN);
			const dir = mPos.sub(stage.player.position);
			dir.normalize();

			debugDiv.empty();
			debugDiv.append(`<span>${stage.player.toString()}</span><br>`)
			debugDiv.append(`<span>Mouse: (${mPos.x}, ${mPos.y})</span><br>`);
			debugDiv.append(`<span>Direction: ${dir.toString()}</span>`);
		}
	}, 1000 / FRAMES_PER_SECOND);
}
function pauseGame() {
	clearInterval(interval);
	interval = null;
}
function moveByKey(event, released) {
	var key = event.key;
	if (key === 'x' && !released) stage.player.deployItem(mousePos);
	var moveMap = {
		'a': new Pair(-3, 0),
		's': new Pair(0, 3),
		'd': new Pair(3, 0),
		'w': new Pair(0, -3),
	};
	if (released) {
		const keyIndex = lastKey.findIndex((value) => value === key);
		if (keyIndex !== -1) {
			lastKey.splice(keyIndex, 1);
			const p = stage.player;
			const oldV = moveMap[key];
			const negated = new Pair(-oldV.x, -oldV.y);
			p.velocity = p.velocity.add(negated)
		}

		return;
	}

	if (key in moveMap) {
		const keyIndex = lastKey.findIndex((value) => value === key);
		if (keyIndex === -1) {
			lastKey.push(key);
			const p = stage.player;
			p.velocity = p.velocity.add(moveMap[key])
		}
	}
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function login() {
	credentials = {
		"username": $("#username").val(),
		"password": $("#password").val()
	};

	$.ajax({
		method: "POST",
		url: "/api/auth/login",
		data: JSON.stringify({}),
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
		processData: false,
		contentType: "application/json; charset=utf-8",
		dataType: "json"
	}).done(function (data, text_status, jqXHR) {
		console.log(jqXHR.status + " " + text_status + JSON.stringify(data));

		$("#ui_login").hide();
		$("#ui_play").show();

		setupGame();
		startGame();

	}).fail(function (err) {
		console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
	});
}

// Using the /api/auth/test route, must send authorization header
function test() {
	$.ajax({
		method: "GET",
		url: "/api/auth/test",
		data: {},
		headers: { "Authorization": "Basic " + btoa(credentials.username + ":" + credentials.password) },
		dataType: "json"
	}).done(function (data, text_status, jqXHR) {
		console.log(jqXHR.status + " " + text_status + JSON.stringify(data));
	}).fail(function (err) {
		console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
	});
}

$(function () {
	// Setup all events here and display the appropriate UI
	$("#loginSubmit").on('click', function () { login(); });
	$("#ui_login").show();
	$("#ui_play").hide();
	debugDiv = $("#debug");
});

