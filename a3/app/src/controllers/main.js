import { Stage } from '../models/Game';
import { Pair } from '../models/utils';
// import { login, register, reportScore, getLeaderboard, fetchUserData, updateInfo, deleteProfile } from './APICallers'; 
// import { showOverlay, showDebugInfo, renderUI, populateLeaderboard, renderProfile } from './renderer';
import { Socket } from './socket';

var stage = null;
var interval = null;
var lastKey = [];
var mousePos = null;
var DEBUG_MODE = false;
var lastRenderTime = 0;
var delta = 0;
var pauseStatus = false;
var username = null;
var backgroundSound = new Audio('../assets/background_music.mp3');
/** @type {Socket} */
var socket = null;
/** @type {function():void} */
var onPlayerDeath = null;
/** @type {function(boolean):void} */
var uiPauseCallback = null;
/** @type {function(Object):void} */
var inventoryUpdateCallback = null;
var accumTime = 0;
var keysPressed = [];

function initGame() {
	stage = new Stage(document.getElementById('stage'), username, onPlayerDeath);
	pauseStatus = false;
}

function setupGame() {
	initGame();

	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', (event) => moveByKey(event, false));
	document.addEventListener('keyup', (event) => moveByKey(event, true));
	window.onblur = function () {
		keysPressed.forEach(key => {
			moveByKey({ key }, true)
		});
	}
	document.addEventListener('click', (event) => {
		if (!stage.player) return;
		if (!pauseStatus) {
			stage.player.fire(); // @todo
			enqueueAction('fire');
		}
	});
	document.addEventListener('mousedown', (event) => {
		if (!stage.player) return;
		if (!pauseStatus) {
			interval = stage.player.fire(true); // @todo
			enqueueAction('fire_auto');
		}
	});

	document.addEventListener('mouseup', (event) => {
		if (!stage.player) return;
		interval !== null && clearInterval(interval);
		enqueueAction('fire_stop');
	});

	stage.canvas.addEventListener('mousemove', function (evt) {
		if (!stage.player) return;
		mousePos = getMousePos(stage.canvas, evt);
		mousePos.x += stage.ptrOffset.x; // @todo
		mousePos.y += stage.ptrOffset.y; // @todo
		const dir = (new Pair(mousePos.x, mousePos.y)).sub(stage.player.position);
		dir.normalize();
		stage.ptrDirection = dir; // @todo
	});
}

function gameLoop(t) {
	requestAnimationFrame(gameLoop);
	delta = t - lastRenderTime;
	accumTime += delta;
	lastRenderTime = t;
	stage.step(delta);
	stage.draw();
	if (accumTime >= 250) {
		stage.player && inventoryUpdateCallback(stage.player.inventory);
		accumTime = 0;
	}
}

function startGame() {
	requestAnimationFrame(gameLoop);
	backgroundSound.play();
	backgroundSound.loop = true;
}
function pauseGame() { stage.togglePause(); }

function enqueueAction(action) {
	socket.userActions.push(action);
}

function moveByKey(event, released) {
	var key = event.key;
	if (!released) keysPressed.push(key);
	if (released) keysPressed.splice(keysPressed.findIndex((v) => v === key), 1);
	// @todo
	if (key === 'x' && !released && !pauseStatus) enqueueAction('deploy_brick_wall');
	if (key === 'c' && !released && !pauseStatus) enqueueAction('deploy_steel_wall');
	if (key === 'f' && !released && !pauseStatus) enqueueAction('pick');
	if (Number(key) && !released) {
		enqueueAction(`switch_weapon_${Number(key) - 1}`);
		stage.player.switchWeapon(Number(key) - 1);
	}
	if (key === 'r' && !released && !pauseStatus) {
		enqueueAction('reload');
		stage.player.reload();
	}
	if (key === 'Escape' && !released) togglePause();
	// for debugging
	if (key === ';' && !released) DEBUG_MODE = !DEBUG_MODE;

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

export function setPauseCallback(callback) {
	uiPauseCallback = callback;
}

function togglePause() {
	pauseGame();
	pauseStatus = !pauseStatus;
	uiPauseCallback(pauseStatus);
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

export function initSocketConnection(_username, _onPlayerDeath, errCallback, showWaitingScreen) {
	username = _username;
	onPlayerDeath = _onPlayerDeath;
	setupGame();
	socket = new Socket(stage, 60, errCallback, showWaitingScreen);
	socket.connect(username);
	startGame();
}

export function disconnectSocket() {
	socket.disconnect();
}

export function setInventoryCallback(callback) {
	inventoryUpdateCallback = callback;
}

