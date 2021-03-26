import { Pair } from '../models/utils';
 
export function showOverlay(text) {
	$("#overlay").show();
	$("#navbar").show();
	$("#overlay-text").text(text);
	$("#overlay-text").show();
	$("#controls").hide();
	$("#leaderboard").hide();
	$("#profile").hide();
}

export function showDebugInfo(debugDiv, stage, mousePos, frametime) {
	debugDiv.empty();

	var mPos = mousePos !== null ? new Pair(mousePos.x, mousePos.y) : new Pair(NaN, NaN);
	const dir = mPos.sub(stage.player.position);
	dir.normalize();

	debugDiv.append(`<span>${stage.player.toString()}</span><br>`)
	debugDiv.append(`<span>Mouse: (${mPos.x.toFixed(2)}, ${mPos.y.toFixed(2)})</span><br>`);
	debugDiv.append(`<span>Direction: ${stage.ptrDirection.toString()}</span><br>`);
	debugDiv.append(`<span>Object count: ${stage.actors.length}</span><br>`);
	frametime > 0 && debugDiv.append(`<span>FPS: ${Math.round(1000 / frametime)} (${frametime.toFixed(2)} ms)</span><br><br>`);
	if (stage.player.inventory.weapons.length > 0) {
		var reserves = stage.player.inventory.weapons[stage.player.inventory.equippedWeapon].label === 'AR' ? stage.player.inventory.ARammo :
			stage.player.inventory.SMGammo;
		debugDiv.append(`<span>Ammo: ${stage.player.inventory.weapons[stage.player.inventory.equippedWeapon].currentAmmo}</span>
		<span> / ${reserves}</span><br>`);
	}
}

export function renderUI(inventoryUIDiv, stage) {
	$("#weapons").empty();
	if (!stage.player) return;
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
	inventoryUIDiv.append(`<span><b>Inventory</b></span><br><br>`);
	inventoryUIDiv.append(`<span>Brick in inventory: ${stage.player.inventory.brick}</span><br>`);
	inventoryUIDiv.append(`<span>Steel in inventory: ${stage.player.inventory.steel}</span><br>`);
	inventoryUIDiv.append(`<span>Enemies remaining in round: ${stage.activeAI}</span><br>`);
	inventoryUIDiv.append(`<span>Score: ${stage.score}</span><br>`);
	inventoryUIDiv.append(`<span>Round: ${stage.round}</span><br><br>`);
	if (stage.player.inventory.weapons.length > 0) {
		var reserves = stage.player.inventory.weapons[stage.player.inventory.equippedWeapon].label === 'AR' ?
			stage.player.inventory.ARammo : stage.player.inventory.SMGammo;
		inventoryUIDiv.append(`<span>Ammo: ${stage.player.inventory.weapons[stage.player.inventory.equippedWeapon].currentAmmo}</span>
			<span> / ${reserves}</span><br>`);
	}

}

export function populateLeaderboard(leaderboardDiv, data) {
	leaderboardDiv.empty();
	leaderboardDiv.append(`<h2 id="overlay-text">Leaderboard</h2>`);
	leaderboardDiv.append(`
	<div id="leaderboardEntry">
		<span id="leaderboardHeader">Username</span>
		<span id="leaderboardHeader">Score</span>
	</div><br>`);

	data.forEach(entry => {
		leaderboardDiv.append(`
		<div id="leaderboardEntry">
		<span style="color: white; font-weight: 200;">${entry.username}</span>
		<span style="color: white; font-weight: 200;">${entry.highscore}</span>
		</div><br>`);
	});
}

export function renderProfile(profileDiv, profile) {
	profileDiv.show();

    $("#usernameInput").val(profile.username);
    $("#emailInput").val(profile.email);
	
	if (profile.gender === 'M'){
		$("#maleUpdate").prop('checked', true);
	}
	else if (profile.gender === 'F'){
		$("#femaleUpdate").prop('checked', true);
	}
	else if (profile.gender === 'O'){
		$("#otherUpdate").prop('checked', true);
	}
}