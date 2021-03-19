import { Stage } from './models/Game';
import { Pair } from './models/utils';

var stage = null;
var view = null;
var interval = null;
var credentials = { "username": "", "password": "" };
var lastKey = [];
var mousePos = null;
var debugDiv = null;
var inventoryUIDiv = null;
var DEBUG_MODE = true;
var lastRenderTime = 0;
var delta = 0;
var pauseStatus = false;

function showOverlay(text) {
	$("#overlay").show();
	$("#navbar").show();
	$("#overlay-text").text(text);
	$("#overlay-text").show();
	$("#controls").hide();
}

function initGame() {
	stage = new Stage(document.getElementById('stage'), (() => {
		showOverlay('Game Over');
		pauseGame();
	}), reportScore);
	pauseStatus = false;
}

function setupGame() {
	initGame();

	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', () => moveByKey(event, false));
	document.addEventListener('keyup', () => moveByKey(event, true));
	document.addEventListener('click', (event) => {
		if (!pauseStatus)
			stage.player.fire();
	});
	document.addEventListener('mousedown', (event) => {
		if (!pauseStatus)
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
	debugDiv.empty();
	if (!DEBUG_MODE) return;

	var mPos = mousePos !== null ? new Pair(mousePos.x, mousePos.y) : new Pair(NaN, NaN);
	const dir = mPos.sub(stage.player.position);
	dir.normalize();

	debugDiv.append(`<span>${stage.player.toString()}</span><br>`)
	debugDiv.append(`<span>Mouse: (${mPos.x.toFixed(2)}, ${mPos.y.toFixed(2)})</span><br>`);
	debugDiv.append(`<span>Direction: ${stage.ptrDirection.toString()}</span><br>`);
	debugDiv.append(`<span>Object count: ${stage.actors.length}</span><br>`);
	delta > 0 && debugDiv.append(`<span>FPS: ${Math.round(1000 / delta)} (${delta.toFixed(2)} ms)</span><br><br>`);
	if (stage.player.inventory.weapons.length > 0) {
		var reserves = stage.player.inventory.weapons[stage.player.inventory.equippedWeapon].label === 'AR' ? stage.player.inventory.ARammo :
			stage.player.inventory.SMGammo;
		debugDiv.append(`<span>Ammo: ${stage.player.inventory.weapons[stage.player.inventory.equippedWeapon].currentAmmo}</span>
		<span> / ${reserves}</span><br>`);
	}
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

	inventoryUIDiv.empty();
	if (DEBUG_MODE) return;
	inventoryUIDiv.append(`<span><b>Inventory</b></span><br><br>`);
	inventoryUIDiv.append(`<span>Brick in inventory: ${stage.player.inventory.brick}</span><br>`);
	inventoryUIDiv.append(`<span>Steel in inventory: ${stage.player.inventory.steel}</span><br>`);
	inventoryUIDiv.append(`<span>Enemies remaining in round: ${stage.activeAI}</span><br>`);
	inventoryUIDiv.append(`<span>Round: ${stage.spawner.round}</span><br><br>`);
	if (stage.player.inventory.weapons.length > 0) {
		var reserves = stage.player.inventory.weapons[stage.player.inventory.equippedWeapon].label === 'AR' ?
			stage.player.inventory.ARammo : stage.player.inventory.SMGammo;
		inventoryUIDiv.append(`<span>Ammo: ${stage.player.inventory.weapons[stage.player.inventory.equippedWeapon].currentAmmo}</span>
			<span> / ${reserves}</span><br>`);
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

function startGame() { requestAnimationFrame(gameLoop); }
function pauseGame() { stage.togglePause(); }

function moveByKey(event, released) {
	var key = event.key;
	if (key === 'x' && !released && !pauseStatus) stage.player.deployItem();
	if (key === 'c' && !released && !pauseStatus) stage.player.deploySteelWall();
	if (key === 'f' && !released && !pauseStatus) stage.player.pickupItem();
	if (key === 'r' && !released && !pauseStatus) stage.player.reload();
	if (key === 'Escape' && !released) togglePause();
	// for debugging
	if (key === ';' && !released) DEBUG_MODE = !DEBUG_MODE;
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

	if (key in moveMap && !pauseStatus) {
		const keyIndex = lastKey.findIndex((value) => value === key);
		if (keyIndex === -1) {
			lastKey.push(key);
			const p = stage.player;
			p.velocity = p.velocity.add(moveMap[key])
		}
	}
}

function togglePause() {
	if (!pauseStatus) showOverlay("Paused");
	else {
		$("#overlay").hide();
		$("#navbar").hide();
	}

	pauseGame();
	pauseStatus = !pauseStatus;
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function reportScore(score, kills, round) {
	// make request to server to store the stats for this game
	const stats = {
		'score': score,
		'kills': kills,
		'round': round
	};
	const token = localStorage.getItem('auth');
	if (!token) {
		$("#logout-btn").click();
		return;
	}

	$.ajax({
		method: "POST",
		url: '/api/auth/reportGame',
		data: JSON.stringify(stats),
		processData: false,
		headers: { "Authorization": `Bearer ${token}` },
		contentType: "application/json; charset=utf-8",
		dataType: "json"
	}).done(function (data, text_status, jqXHR) {
		console.log(jqXHR.status + " " + text_status + JSON.stringify(data));
	}).fail(function (err) {
		console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
	});
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

function updateScore() {

	const formData = {
		'username': $('#user').val(),
		'score': stage.score,
		'enemiesKilled': stage.enemiesKilled,
		'roundNo': stage.round
	};

	$.ajax({
		method: "POST",
		url: '/app/registerScore',
		data: JSON.stringify(formData),
		processData: false,
		contentType: "application/json; charset=utf-8",
		dataType: "json"
	}).done(function (data, text_status, jqXHR) {
		console.log(jqXHR.status + " " + text_status + JSON.stringify(data));

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
		url: "/api/login",
		data: JSON.stringify(credentials),
		processData: false,
		contentType: "application/json; charset=utf-8",
		dataType: "json"
	}).done(function (data, text_status, jqXHR) {
		if (jqXHR.status === 200) {
			const token = data.authorization;
			localStorage.setItem('auth', token);

			$("#landing").hide();
			$("#ui_play").show();
			$("#overlay").hide();
		} else {
			$("#err").text(data.error ? data.error : data.message);
		}

		setupGame();
		startGame();
		stage.player.label = credentials.username;

	}).fail(function (err) {
		$("#err").text(err.responseJSON.info);
	});
}

// Using the /api/auth/test route, must send authorization header
function test() {
	const token = localStorage.getItem('auth');
	if (!token) {
		$("#logout-btn").click();
		return;
	}
	$.ajax({
		method: "POST",
		url: "/api/auth/test",
		data: {},
		headers: { "Authorization": `Bearer ${token}` },
		dataType: "json"
	}).done(function (data, text_status, jqXHR) {
		console.log(jqXHR.status + " " + text_status + JSON.stringify(data));
	}).fail(function (err) {
		console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
	});
}

$(function () {
	// Setup all events here and display the appropriate UI
	$("#overlay").hide();
	$("#loginSubmit").on('click', function () { login(); });
	$("#register").on('click', () => register());
	$("#login").on('click', function () {
		$("#landing").show();
		$("#ui_login").show();
		$("#ui_play").hide();
		$("#ui_register").hide();
		$("#left-text").text("LOGIN");
	});
	$("#leaderboard-btn").on('click', () => {
		test();
	});
	$("#register-nav").on('click', function () {
		$("#landing").show();
		$("#ui_login").hide();
		$("#ui_play").hide();
		$("#ui_register").show();
		$("#left-text").text("REGISTER");
	});
	$("#restart-btn").on('click', function () {
		initGame();
		$("#overlay").hide();
	});
	$("#control-btn").on('click', function () {
		$("#overlay-text").hide();
		$("#controls").show();
	})

	$("#logout-btn").on('click', function () {
		$("#landing").show();
		$("#ui_login").show();
		$("#left-text").text("LOGIN");
		$("#ui_play").hide();
		$("#ui_register").hide();
		$("#restart").hide();
		$("#navbar").hide();
		$("#overlay").hide();
		localStorage.removeItem('auth');
	});

	$("#landing").show();
	$("#ui_login").show();
	$("#left-text").text("LOGIN");
	$("#ui_play").hide();
	$("#ui_register").hide();
	$("#restart").hide();
	$("#navbar").hide();
	$("#controls").hide();
	debugDiv = $("#debug");
	inventoryUIDiv = $("#inventory-ui");
});

