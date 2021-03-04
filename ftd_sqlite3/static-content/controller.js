stage=null;
view = null;
interval=null;
canvas=null;
gui_state = {
	isLoggedIn : false,
	user     : "",
	password : ""
};

function showUI(ui){
	$(".ui_top").hide();
	clearErrors(ui);
	if(!gui_state.isLoggedIn){
		$("#ui_nav").hide();
		if(ui!="#ui_login" && ui!="#ui_register"){
			ui="#ui_login";
		}
	} else {
		var ui_name = ui.substr(1); // remove the #
		$("#ui_nav").show();
		$("#ui_nav a").removeClass("nav_selected");
		$("#ui_nav a[name="+ui_name+"]").addClass("nav_selected");
	}
	if(ui=="#ui_play")startGame();
	else pauseGame();
	$(ui).show();
}

//Get Mouse Position
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function setupGame(){
	canvas=document.getElementById('stage');
	stage=new Stage(canvas);

	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', function(event){
		var key = event.key;
		var moveMap = { 
			'a': { "dx": -1, "dy": 0},
			's': { "dx": 0, "dy": 1},
			'd': { "dx": 1, "dy": 0},
			'w': { "dx": 0, "dy": -1}
		};
		if(key in moveMap){
			stage.player.setDirection(moveMap[key].dx, moveMap[key].dy);
		} else if(key=="e"){
			stage.player.setPickup(true);
		}
	});
	//report the mouse position on click
	canvas.addEventListener("mousemove", function (event) {
    		var mousePos = getMousePos(canvas, event);
    		// console.log(mousePos.x + ',' + mousePos.y);
		stage.mouseMove(mousePos.x, mousePos.y);
	}, false);
	canvas.addEventListener("click", function (event) {
    		var mousePos = getMousePos(canvas, event);
    		// console.log(mousePos.x + ',' + mousePos.y);
		stage.mouseClick(mousePos.x, mousePos.y);
	}, false);
}

function startGame(){
	interval=setInterval(function(){ stage.animate(); },20);
}
function pauseGame(){
	clearInterval(interval);
	interval=null;
}

function gui_logout(){
	gui_state.isLoggedIn=false;
	gui_state.user="";
	gui_state.password="";
	showUI("#ui_login");
}

function clearErrors(ui){
	$(ui+" .form-errors").html("");
}

function showErrors(ui,response){
	let s="";
	let errors=response.error;
	for(let e in errors){
		s = s+errors[e]+"<br/>";
	}
	$(ui+" .form-errors").html(s);
}

function gui_login(){
	var user = $("#ui_login [name=user]").val();
	var password = $("#ui_login [name=password]").val();
	clearErrors("#ui_login");
	var f = function(data, success){
		var s = success && data.success;
		if(s){
			gui_state.isLoggedIn=true;
			gui_state.user=user;
			gui_state.password=password;
                        setupGame(); 
                        showUI("#ui_play");
		} else {
			gui_state.isLoggedIn=false;
			gui_state.user="";
			gui_state.password="";
                        showUI("#ui_login");
			showErrors("#ui_login",data);
		}
	}
	api_login(user, password, f);
}

function checkboxSelected(value){
	if(value)return true;
	return false;
}

function getProfileFromForm(formId){
	var data = {
		user : $(formId+" [data-name=user]").val(),
		password : $(formId+" [data-name=password]").val(),
		confirmpassword : $(formId+" [data-name=confirmpassword]").val(),
		skill : $(formId+" [data-name=skill]:checked").val(),
		year: $(formId+" [data-name=year]").val(),
		month: $(formId+" [data-name=month]").val(),
		day: $(formId+" [data-name=day]").val(),
		playmorning: checkboxSelected($(formId+" [data-name=playmorning]:checked").val()),
		playafternoon: checkboxSelected($(formId+" [data-name=playafternoon]:checked").val()),
		playevening: checkboxSelected($(formId+" [data-name=playevening]:checked").val())
	};
	return data;
}

function gui_register(){
	clearErrors("#ui_register");
	var data = getProfileFromForm("#ui_register");
	var f = function(response, success){
		if(success){
                        showUI("#ui_login");
		} else {
			showErrors("#ui_register",response);
		}
	}
	api_register(data, f);
}

function gui_profile(){
	clearErrors("#ui_profile");
	var data = getProfileFromForm("#ui_profile");
	var f = function(response, success){
		if(success){
			gui_state.password = data.password; // in case password changed
		} else {
			showErrors("#ui_profile",response);
		}
	}
	var credentials = { user: gui_state.user, password: gui_state.password };
	api_profile(data, f, credentials);
}

function putDataIntoProfileForm(data){
	var formId="#ui_profile";
	$(formId+" [data-name=user]").html(data.user);
	$(formId+" [data-name=password]").val(data.password);
	$(formId+" [data-name=confirmpassword]").val(data.password);
	$(formId+" [data-name=skill][value="+data.skill+"]").attr('checked',true);
	$(formId+" [data-name=year]").val(data.year);
	$(formId+" [data-name=month]").val(data.month);
	$(formId+" [data-name=day]").val(data.day);
	$(formId+" [data-name=playmorning]").attr('checked', data.playmorning==1);
	$(formId+" [data-name=playafternoon]").attr('checked', data.playafternoon==1);
	$(formId+" [data-name=playevening]").attr('checked', data.playevening==1);
}

function gui_profile_load(){
	var credentials = { user: gui_state.user, password: gui_state.password };
	var f = function(response, success){
		if(success){
			// response.data has fields to load into our form
			putDataIntoProfileForm(response.data);
			showUI("#ui_profile");
		} else {
			showErrors("#ui_profile",response);
		}
	}
	var credentials = { user: gui_state.user, password: gui_state.password };
	api_profile_load(f, credentials);
}

// This is executed when the document is ready (the DOM for this document is loaded)
$(function(){
        showUI("#ui_login");
});

