import { useState } from 'react';
import TransparentInput from '../TransparentInput/TransparentInput';
import TransparentButton from '../TransparentButton/TransparentButton';
import InfoPopup from '../InfoPopup/InfoPopup';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

async function update(
	username,
	email,
	gender,
	setSuccessOpen, 
    setShowErr,
    setErr) {
	try {
        console.log(username, email, gender)
        const token = localStorage.getItem('auth');
		const res = await fetch('http://localhost:8000/api/auth/profile/update', {
			method: 'PATCH',
            headers: {
				'Content-Type': 'application/json; charset=utf-8',
                "Authorization": `Bearer ${token}`
            },
			body: JSON.stringify({ username, email, gender })
		});
		const resJson = await res.json();

		if (res.status !== 200) {
			// show error
			setErr(resJson.info);
            setShowErr(true);
		} else {
			// registration successful
            setSuccessOpen(true);
			setErr('');
		}

	} catch (error) {
		console.log({ error });
		setErr(error.toString());
		console.log(error);
	}
}

const Profile = () => {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [gender, setGender] = useState('');
	const [err, setErr] = useState('');
	const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [successPopup, setSuccessOpen] = useState(false);
    const [showErr, setShowErr] = useState(false);

    const handleChange = (event) => {
		setGender(event.target.value);
	};

    return (
        <div id="profile">
            <h2 id="overlay-text" style={{ alignSelf: 'center', color: 'white' }}>Profile</h2>
                <TransparentInput
                    label='Username'
                    type='text'
                    color='white'
                    labelStyle={{ alignSelf: 'center', color: 'white' }}
                    onChange={(e) => setUsername(e.target.value)}
                />

            <br />

            <TransparentInput
                label='Email'
                type='email'
                color='white'
                labelStyle={{ alignSelf: 'center', color: 'white' }}
                onChange={(e) => setEmail(e.target.value)}
            />
            <br />

            <FormControl component="fieldset">
                <FormLabel component="legend"><Typography style={{color: 'white'}}>Gender</Typography></FormLabel>
                <RadioGroup aria-label="gender" row name="gender1" value={gender} onChange={handleChange}>
                    <FormControlLabel labelPlacement='top' value="F" control={<Radio style={{color: 'white'}} />} label={<Typography style={{color: 'white'}}>Female</Typography>}/>
                    <FormControlLabel labelPlacement='top' value="M" control={<Radio style={{color: 'white'}} />} label={<Typography style={{color: 'white'}}>Male</Typography>} />
                    <FormControlLabel labelPlacement='top' value="O" control={<Radio style={{color: 'white'}} />} label={<Typography style={{color: 'white'}}>Other</Typography>} />
                </RadioGroup>
            </FormControl>

            <br /><br /><br />
            <TransparentButton
                color='#c2b5b5'
                hoverColor='#261D20'
                type='button'
                value='Update'
                onClick={() => update(username, email, gender, setSuccessOpen, setShowErr, setErr)}
            />
            {/* <TransparentButton
                color='#c2b5b5'
                hoverColor='#261D20'
                type='button'
                value='Delete'
                onClick={() => console.log('clicked Delete')}
            />
            <br /> */}

            <InfoPopup
                msg={'Update Success!'}
                severity='success'
                open={successPopup}
                onClose={() => setSuccessOpen(false)}
            />
            <InfoPopup
                msg={err}
                severity='error'
                open={showErr}
                onClose={() => setShowErr(false)}
            />
        </div>
    );
}

export default Profile;