import { useState } from 'react';
import './RightHome.css';
import TransparentButton from '../TransparentButton/TransparentButton';
import TransparentInput from '../TransparentInput/TransparentInput';
import InfoPopup from '../InfoPopup/InfoPopup';

async function register(
	username,
	password,
	confirmPassword,
	email,
	gender,
	setErr,
	onSuccess) {

	try {
		const res = await fetch('http://localhost:8000/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			body: JSON.stringify({ username, password, confirmPassword, gender, email })
		});
		console.log('sending request');
		const resJson = await res.json();

		if (res.status !== 201) {
			// show error
			setErr(resJson.info);
		} else {
			// registration successful
			setErr('');
			localStorage.setItem('auth', resJson.authorization);
			onSuccess();
		}

	} catch (error) {
		console.log({ error });
		setErr(error.toString());
		console.log(error);
	}
}

const RegisterForm = ({ onLoginClick, onRegister }) => {

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [email, setEmail] = useState('');
	const [gender, setGender] = useState('');
	const [err, setErr] = useState('');
	const [showErrorPopup, setShowErrorPopup] = useState(false);

	const labelStyle = {
		fontSize: '1.25em',
		color: 'white',
		fontSize: '1.5em',
		fontWeight: '300',
		marginLeft: '5px',
		color: '#261D20'
	};

	const onSuccess = () => {
		onRegister();
		onLoginClick();
	}

	const onErr = (_err) => {
		setErr(_err);
		setShowErrorPopup(true);
	}

	return (
		<div id="ui_register">
			<div>
				<TransparentInput
					label='Username'
					labelStyle={labelStyle}
					color='white'
					type='text'
					onChange={(e) => setUsername(e.target.value)}
					autofocus={true}
				/>

				<br /><br />

				<TransparentInput
					label='Email'
					labelStyle={labelStyle}
					color='white'
					type='email'
					onChange={(e) => setEmail(e.target.value)}
				/>
				<br /><br />

				<div>
					<span>Gender</span><br />
					<div style={{
						display: 'flex',
						justifyContent: 'space-evenly'
					}}>
						<label for="male">Male</label>
						<input id="male" className="input" type="radio" name="gender" autocomplete="off" required
							value="M"
							onChange={(e) => setGender('M')}
							autofocus />
						<label for="female">Female</label>
						<input id="female" className="input" type="radio" name="gender" autocomplete="off" required
							value="F"
							onChange={(e) => setGender('F')}
							autofocus />
						<label for="other">Other</label>
						<input id="other" className="input" type="radio" name="gender" autocomplete="off" required
							value="O"
							onChange={(e) => setGender('O')}
							autofocus />
					</div>
				</div>
				<br /><br />

				<TransparentInput
					label='Password'
					labelStyle={labelStyle}
					color='white'
					type='password'
					onChange={(e) => setPassword(e.target.value)}
				/>
				<br /><br />

				<TransparentInput
					label='Confirm Password'
					labelStyle={labelStyle}
					color='white'
					type='password'
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>
				<br /><br />
				<span id="register-err" style={{
					display: 'flex',
					justifyContent: 'space-evenly'
				}}>
				</span>
			</div>

			<br /><br />

			<TransparentButton
				color='#261D20'
				hoverColor='#F24141'
				type='submit'
				value='REGISTER'
				onClick={() => register(username, password, confirmPassword, email, gender, onErr, onSuccess)}
			/>
			<br /><br />
			<TransparentButton
				color='#261D20'
				hoverColor='#F24141'
				type='submit'
				value='LOGIN'
				onClick={onLoginClick}
			/>

			<InfoPopup
				msg={err}
				open={showErrorPopup}
				severity={'error'}
				autoHideDuration={null}
				onClose={() => setShowErrorPopup(false)}
			/>
		</div>
	);
}

export default RegisterForm;