import { useState } from 'react';
import TransparentButton from '../TransparentButton/TransparentButton';
import TransparentInput from '../TransparentInput/TransparentInput';
import './RightHome.css';

async function login(username, password, setErr, onLogin) {
    // send API req to login, handle response
    try {
        const res = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({ username, password })
        });

        const resJson = await res.json();

        if (res.status !== 200) {
            // show error
            setErr(resJson.info);
        } else {
            // login successful
            setErr('');
            localStorage.setItem('auth', resJson.authorization);
            onLogin(username);
        }
    } catch (error) {
        // show error
        setErr(error.toString());
        console.log(error);
    }
}

const LoginForm = ({ onRegisterClick, onLogin }) => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');
    const labelStyle = {
        fontWeight: 300,
        fontSize: '1.5em'
    }

    return (
        <div id="ui_login">
            <div>
                <div>
                    <TransparentInput
                    label="username"
                    color="white"
                    type="text"
                    labelStyle={labelStyle}
                    onChange={(e) => setUsername(e.target.value)}
                    required={true}
                    />
                    <br /><br />
                    <div>
                    <TransparentInput
                    label="password"
                    color="white"
                    type="password"
                    labelStyle={labelStyle}
                    onChange={(e) => setPassword(e.target.value)}
                    required={true}
                    />
                    </div>
                    <br /><br />
                    <span id="err"
                    style={{
                        color: "#261D20",
                        overflowWrap: "anywhere",
                    }}>
                    </span>
                    <br /><br />
                </div>

                <br /><br />
                <span>{err}</span>
                <br /><br />

                <TransparentButton
                    color='#261D20'
                    hoverColor='#F24141'
                    type='submit'
                    value='LOGIN'
                    onClick={() => login(username, password, setErr, onLogin)}
                />
                <br />

                <TransparentButton
                    color='#261D20'
                    hoverColor='#F24141'
                    type='submit'
                    value='REGISTER'
                    onClick={onRegisterClick}
                />
            </div>
        </div>
    );
}

export default LoginForm;