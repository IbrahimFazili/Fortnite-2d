import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './RightHome.css';

const RightHome = ({ setLeftText, onLogin, onRegister }) => {
    const [showRegister, setShowRegister] = useState(false);

    return (
        <section id="register-right">
            {!showRegister && <LoginForm onRegisterClick={() => {
                setShowRegister(true);
                setLeftText('Register');
            }}
            onLogin={onLogin}
            />}
            {showRegister && <RegisterForm onLoginClick={() => {
                setShowRegister(false);
                setLeftText('Login');
            }
            }
            onRegister={onRegister}
            />}
        </section>
    );
}

export default RightHome;