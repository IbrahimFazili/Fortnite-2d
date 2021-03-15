import { Stage } from './models/Game';
import { Pair, LOG_QUEUE } from './models/utils';

var stage = null;
var view = null;
var interval = null;
var credentials = { "username": "", "password": "" };
var lastKey = [];
var mousePos = null;
var debugDiv = null;
var DEBUG_MODE = true;
var lastRenderTime = 0;
var delta = 0;

// function showLogs() {
// 	const curr = Date.now();
// 	// need to fix this
// 	// LOG_QUEUE = LOG_QUEUE.filter((log) => (curr - log.timestamp < 1000 * 5));

// 	LOG_QUEUE.forEach(log => {
// 		debugDiv.append(`<span>[LOG] ${log.text}</span><br>`);
// 	});
// }

function setupGame() {
	stage = new Stage(document.getElementById('stage'));

	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', () => moveByKey(event, false));
	document.addEventListener('keyup', () => moveByKey(event, true));
	document.addEventListener('click', (event) => {
		stage.player.fire();
	});
	document.addEventListener('mousedown', (event) => {
		interval = stage.player.fire(true);
	});

	document.addEventListener('mouseup', (event) => {
		interval !== null && clearInterval(interval);
	});

	stage.canvas.addEventListener('mousemove', function (evt) {
		mousePos = getMousePos(stage.canvas, evt);
		mousePos.x += stage.ptrOffset.x;
		mousePos.y += stage.ptrOffset.y;
		const dir = (new Pair(mousePos.x, mousePos.y)).sub(stage.player.position);
		dir.normalize();
		stage.ptrDirection = dir;
	});
}

function showDebugInfo() {
	if (!DEBUG_MODE) return;
	var mPos = mousePos !== null ? new Pair(mousePos.x, mousePos.y) : new Pair(NaN, NaN);
	const dir = mPos.sub(stage.player.position);
	dir.normalize();

	debugDiv.empty();
	debugDiv.append(`<span>${stage.player.toString()}</span><br>`)
	debugDiv.append(`<span>Mouse: (${mPos.x.toFixed(2)}, ${mPos.y.toFixed(2)})</span><br>`);
	debugDiv.append(`<span>Direction: ${stage.ptrDirection.toString()}</span><br>`);
	debugDiv.append(`<span>Object count: ${stage.actors.length}</span><br>`);
	// debugDiv.append(`<span>Gun: ${stage.player.inventory.weapons[stage.player.inventory.equippedWeapon]}</span><br>`);
	delta > 0 && debugDiv.append(`<span>FPS: ${Math.round(1000 / delta)} (${delta.toFixed(2)} ms)</span><br>`);
}

function renderUI() {
	$("#weapons").empty();
	let rem = stage.player.inventory.maxWeaponSlots;
	stage.player.inventory.weapons.forEach((e, i) => {
		const img = e.label === 'AR' ? './assets/AR.png' : './assets/SMG.png';
		const selected = i === stage.player.inventory.equippedWeapon;
		$("#weapons").append(`<img
		src="${img}"
		class="weapon-img ${selected ? 'weapon-selected' : ''}"
		/>`);
		rem--;
	});

	const noWeapons = rem === stage.player.inventory.maxWeaponSlots;
	for (; rem > 0; rem--) {
		$("#weapons").append(`<div class="weapon-img" />`);
	}
}

function gameLoop(t) {
	requestAnimationFrame(gameLoop);
	delta = t - lastRenderTime;
	lastRenderTime = t;
	stage.step(delta);
	stage.draw();
	renderUI();
	showDebugInfo();
}
function startGame() {
	requestAnimationFrame(gameLoop);
}
function pauseGame() {
	clearInterval(interval);
	interval = null;
}
function moveByKey(event, released) {
	var key = event.key;
	if (key === 'x' && !released) stage.player.deployItem();
	if (key === 'f' && !released) stage.player.pickupItem();
	if (key === 'r' && !released) stage.player.reload();
	if (key === 'i' && !released) stage.trigger();
	if (Number(key) && !released) stage.player.switchWeapon(Number(key) - 1);
	var moveMap = {
		'a': new Pair(-100, 0),
		's': new Pair(0, 100),
		'd': new Pair(100, 0),
		'w': new Pair(0, -100),
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

function register() {
	const formData = {
		'username': $("#user").val(),
		'password': $("#pass").val(),
		'confirmPassword': $("#confirm-pass").val()
	};

	if (formData.password !== formData.confirmPassword) {
		alert("Passwords don't match!");
		return;
	}

	$.ajax({
		method: "POST",
		url: "/api/register",
		data: JSON.stringify(formData),
		processData: false,
		contentType: "application/json; charset=utf-8",
		dataType: "json"
	}).done(function (data, text_status, jqXHR) {
		console.log(jqXHR.status + " " + text_status + JSON.stringify(data));

		$("#ui_login").show();
		$("#ui_register").hide();

	}).fail(function (err) {
		console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
	});
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

		$("#landing").hide();
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
	$("#register").on('click', () => register());
	$("#login").on('click', function () {
		$("#landing").show();
		$("#ui_login").show();
		$("#ui_play").hide();
		$("#ui_register").hide();
		$("#left-text").text("LOGIN");
	});
	$("#register-nav").on('click', function () {
		$("#landing").show();
		$("#ui_login").hide();
		$("#ui_play").hide();
		$("#ui_register").show();
		$("#left-text").text("REGISTER");
	});

	$("#landing").show();
	$("#ui_login").show();
	$("#left-text").text("LOGIN");
	$("#ui_play").hide();
	$("#ui_register").hide();
	debugDiv = $("#debug");
});

