import { useState } from 'react';
import LeftHome from '../../Components/LeftHome/LeftHome';
import RightHome from '../../Components/RightHome/RightHome';
import './Home.css';

const Home = ({onLogin, onRegister}) => {

    const [leftText, setLeftText] = useState('Login');
    return (
        <div id="landing">
            <main>
                <LeftHome text={leftText}/>
                <RightHome setLeftText={setLeftText} onLogin={onLogin} onRegister={onRegister}/>
            </main>
        </div>
    );
}

export default Home;