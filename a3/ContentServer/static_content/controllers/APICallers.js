
export function reportScore(score, kills, round) {
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

export function updateInfo() {
	return new Promise((resolve, reject) => {
		const formData = {
			'username': $("#usernameInput").val(),
			'email': $("#emailInput").val(),
			'gender': $("input[name='genderInput']:checked").val(),
		};
		const token = localStorage.getItem('auth');
		if (!token) {
			$("#logout-btn").click();
			reject('no auth token found');
		}
		$.ajax({
			method: "PATCH",
			url: "/api/auth/profile/update",
			data: JSON.stringify(formData),
			processData: false,
			contentType: "application/json; charset=utf-8",
			headers: { "Authorization": `Bearer ${token}` },
			dataType: "json"
		}).done(function (data, text_status, jqXHR) {
			if (jqXHR.status === 200) {
				// update the token since the username may have changed
				localStorage.setItem('auth', data.authorization);
				$("#overlay-text").show();
				$("#profile").hide();
				$("#profile-err").hide();
				resolve(formData.username);
			} else {
				resolve();
			}
		}).fail(function (err) {
			console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
			$("#profile-err").text(err.responseJSON.info);
			$("#profile-err").show();
			reject(err);
		});
	});
}

export function deleteProfile(){
	const token = localStorage.getItem('auth');
	if (!token) {
		$("#logout-btn").click();
	}
	$.ajax({
		method: "DELETE",
		url: "/api/auth/profile",
		processData: false,
		contentType: "application/json; charset=utf-8",
		headers: { "Authorization": `Bearer ${token}` },
		dataType: "json"
	}).done(function (data, text_status, jqXHR) {
		if (jqXHR.status === 200) {
			// update the token since the username may have changed
			$("#landing").show();
			$("#ui_login").show();
			$("#left-text").text("LOGIN");
			$("#ui_play").hide();
			$("#ui_register").hide();
			$("#restart").hide();
			$("#navbar").hide();
			$("#overlay").hide();
			localStorage.removeItem('auth');
			if (backgroundSound !== null) backgroundSound.pause();
		}
	}).fail(function (err) {
		console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
		$("#profile-err").text(err.responseJSON.info);
		$("#profile-err").show();
	});
}

export function register() {
	const formData = {
		'username': $("#user").val(),
		'password': $("#pass").val(),
		'confirmPassword': $("#confirm-pass").val(),
		'gender': $("input[name='gender']:checked").val(),
		'email': $("#email").val()
	};

	if (formData.password !== formData.confirmPassword) {
		// alert("Passwords don't match!");
		$("#register-err").text("Passwords don't match!");
		$("#register-err").show();
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
		$("#register-err").hide();

	}).fail(function (err) {
		console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
		$("#register-err").text(err.responseJSON.info);
		$("#register-err").show();
	});
}

export function getLeaderboard() {
	return new Promise((resolve, reject) => {
		const token = localStorage.getItem('auth');
		if (!token) {
			$("#logout-btn").click();
			reject('no auth token found');
		}
		$.ajax({
			method: "GET",
			url: '/api/auth/leaderboard',
			data: {},
			processData: false,
			headers: { "Authorization": `Bearer ${token}` },
			contentType: "application/json; charset=utf-8",
			dataType: "json"
		}).done(function (data, text_status, jqXHR) {
			resolve(data);
		}).fail(function (err) {
			console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
			reject(err);
		});
	});
}

export function fetchUserData() {

	return new Promise((resolve, reject) => {
		const token = localStorage.getItem('auth');
		if (!token) {
			$("#logout-btn").click();
			return;
		}
	
		$.ajax({
			method: "GET",
			url: '/api/auth/profile',
			processData: false,
			headers: { "Authorization": `Bearer ${token}` },
			contentType: "application/json; charset=utf-8",
			dataType: "json"
		}).done(function (data, text_status, jqXHR) {
			resolve(data)
		}).fail(function (err) {
			console.log("fail " + err.status + " " + JSON.stringify(err.responseJSON));
			reject(err);
		});
	})
}


export function login() {

	const credentials = {
		"username": $("#username").val(),
		"password": $("#password").val()
	};

    return new Promise((resolve, reject) => {
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

            resolve(credentials.username);
    
        }).fail(function (err) {
            $("#err").text(err.responseJSON.info);
            reject(err);
        });
    });
}
