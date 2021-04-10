import { useState } from 'react';
import './RightHome.css';
import TransparentButton from '../TransparentButton/TransparentButton';
import TransparentInput from '../TransparentInput/TransparentInput';
import InfoPopup from '../InfoPopup/InfoPopup';
import Typography from '@material-ui/core/Typography';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';


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

	const handleChange = (event) => {
		setGender(event.target.value);
	};

	return (
		<div id="ui_register">
			<div className='form'>
				<TransparentInput
					label='Username'
					labelStyle={labelStyle}
					color='white'
					type='text'
					onChange={(e) => setUsername(e.target.value)}
					autofocus={true}
				/>

				<TransparentInput
					label='Email'
					labelStyle={labelStyle}
					color='white'
					type='email'
					onChange={(e) => setEmail(e.target.value)}
				/>

				<FormControl component="fieldset">
					<FormLabel component="legend">{<Typography style={{ color: '#261D20', display: 'flex', justifyContent: 'center' }}>Gender</Typography>}</FormLabel>
					<RadioGroup aria-label="gender" row name="gender1" value={gender} onChange={handleChange}>
						<FormControlLabel labelPlacement='top' value="F" control={<Radio color='white' />} label={<Typography style={{ color: '#261D20' }}>Female</Typography>} />
						<FormControlLabel labelPlacement='top' value="M" control={<Radio color='white' />} label={<Typography style={{ color: '#261D20' }}>Male</Typography>} />
						<FormControlLabel labelPlacement='top' value="O" control={<Radio color='white' />} label={<Typography style={{ color: '#261D20' }}>Other</Typography>} />
					</RadioGroup>
				</FormControl>

				<TransparentInput
					label='Password'
					labelStyle={labelStyle}
					color='white'
					type='password'
					onChange={(e) => setPassword(e.target.value)}
				/>

				<TransparentInput
					label='Confirm Password'
					labelStyle={labelStyle}
					color='white'
					type='password'
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>
			</div>

			<div className='twoBtnDiv'>
				<TransparentButton
					color='#261D20'
					hoverColor='#F24141'
					type='submit'
					value='REGISTER'
					onClick={() => register(username, password, confirmPassword, email, gender, onErr, onSuccess)}
				/>
				<TransparentButton
					color='#261D20'
					hoverColor='#F24141'
					type='submit'
					value='LOGIN'
					onClick={onLoginClick}
				/>
			</div>

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