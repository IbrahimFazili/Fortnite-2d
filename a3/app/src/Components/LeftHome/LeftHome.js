import './LeftHome.css';
import Logo from './Logo.png';

const LeftHome = ({ text }) => {

    return (
        <div id="left">
            <div>
                <div id="logo-container">
                    <img src={Logo} id="logo" alt='our fucking logo' />
                </div>
                <span id="left-text" style={{ fontSize: '3em' }}> {text} </span>
            </div>
        </div>
    );
}

export default LeftHome;