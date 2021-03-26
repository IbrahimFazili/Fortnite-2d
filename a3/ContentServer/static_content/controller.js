import { Stage } from './models/Game';  // @todo
import { Pair } from './models/utils';  // @todo
import { login, register, reportScore, getLeaderboard, fetchUserData, updateInfo, deleteProfile } from './controllers/APICallers'; // @todo
import { showOverlay, showDebugInfo, renderUI, populateLeaderboard, renderProfile } from './controllers/renderer'; // @todo

var stage = null;
var view = null;
var interval = null;
var lastKey = [];
var mousePos = null;
var debugDiv = null;
var inventoryUIDiv = null;
var leaderboardDiv = null;
var profileDiv = null;
var DEBUG_MODE = false;
var lastRenderTime = 0;
var delta = 0;
var pauseStatus = false;
var username = null;
var backgroundSound = new Audio('../assets/background_music.mp3');
var actionQueue = new Array();

function initGame() {
	stage = new Stage(document.getElementById('stage'), (() => { // @todo
		showOverlay('Game Over');
		pauseGame();
	}), reportScore);
	if (username) stage.player.label = username; // @todo
	pauseStatus = false;
}

function setupGame() {
	initGame();

	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', () => moveByKey(event, false));
	document.addEventListener('keyup', () => moveByKey(event, true));
	document.addEventListener('click', (event) => {
		if (!pauseStatus){
			stage.player.fire(); // @todo
			enqueueAction('fire');
		}
	});
	document.addEventListener('mousedown', (event) => {
		if (!pauseStatus){
			interval = stage.player.fire(true); // @todo
			enqueueAction('fire_auto');
		}
	});

	document.addEventListener('mouseup', (event) => {
		interval !== null && clearInterval(interval);
		enqueueAction('fire_stop');
	});

	stage.canvas.addEventListener('mousemove', function (evt) {
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
	lastRenderTime = t;
	stage.step(delta); // @todo
	stage.draw(); // @todo
	if (!DEBUG_MODE) {
		debugDiv.empty();
		renderUI(inventoryUIDiv, stage);
	}
	else {
		inventoryUIDiv.empty();
		showDebugInfo(debugDiv, stage, mousePos, delta);
	}
}

function startGame() { 
	requestAnimationFrame(gameLoop); 
	backgroundSound.play();
	backgroundSound.loop = true;
}
function pauseGame() { stage.togglePause(); } // @tpdp

function enqueueAction(action) {
	this.actionQueue.push(action);
}

function clearActions() {
	actionQueue = [];
}

function moveByKey(event, released) {
	var key = event.key;
	// @todo
	if (key === 'x' && !released && !pauseStatus) {
		enqueueAction('deploy_brick_wall');
		stage.player.deployItem();
	}
	if (key === 'c' && !released && !pauseStatus) {
		enqueueAction('deploy_steel_wall');
		stage.player.deploySteelWall();
	}
	if (key === 'f' && !released && !pauseStatus) {
		enqueueAction('pick')
		stage.player.pickupItem();
	}
	if (key === 'r' && !released && !pauseStatus) {
		enqueueAction('reload');
		stage.player.reload();
	}
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
	if (!pauseStatus) {
		showOverlay("Paused");
	}
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

$(function () {
	// Setup all events here and display the appropriate UI
	$("#overlay").hide();
	$("#loginSubmit").on('click', async () => {
		try {
			// @todo
			const _username = await login();
			username = _username;
			$("#landing").hide();
			$("#ui_play").show();
			$("#overlay").hide();
			setupGame();
            startGame();
		} catch (err) {
			return;
		}
	});

	$("#profileSubmit").on('click', async () => {
		try {
			// @todo
			username = await updateInfo();
			stage.player.label = username;
		} catch (error) {
			console.log(error);
		}
	} );
	$("#profileDelete").on('click', function(){
		deleteProfile();
		
	});

	$("#register").on('click', () => register());
	$("#login").on('click', function () {
		$("#landing").show();
		$("#ui_login").show();
		$("#ui_play").hide();
		$("#ui_register").hide();
		$("#left-text").text("LOGIN");
	});
	$("#leaderboard-btn").on('click', async () => {
		try {
			// @todo
			const data = await getLeaderboard();
			populateLeaderboard(leaderboardDiv, data);
			$("#overlay-text").hide();
			$("#leaderboard").show();
			$("#controls").hide();
			$("#profile").hide();
		} catch (error) {
			console.log(error);	
		}
	});

	$("#profile-btn").on('click', async()=> {
		try{
			// @todo
			const data = await fetchUserData(username);
			$("#overlay-text").hide();
			$("#controls").hide();
			$("#leaderboard").hide();
			renderProfile(profileDiv, data);
			$("#profile").show();
		}
		catch (error){
			console.log(error);
		}
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
		$("#leaderboard").hide();
		$("#profile").hide();
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
		backgroundSound.pause();
	});

	$("#landing").show();
	$("#ui_login").show();
	$("#left-text").text("LOGIN");
	$("#ui_play").hide();
	$("#ui_register").hide();
	$("#restart").hide();
	$("#navbar").hide();
	$("#controls").hide();
	$("#leaderboard").hide();
	$("#profile").hide();
	debugDiv = $("#debug");
	inventoryUIDiv = $("#inventory-ui");
	leaderboardDiv = $("#leaderboard");
	profileDiv = $("#profile");
});

