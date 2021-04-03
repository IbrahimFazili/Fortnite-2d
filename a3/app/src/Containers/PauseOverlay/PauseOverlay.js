import { useState } from 'react';
import './PauseOverlay.css';
import NavBar from '../../Components/NavBar/NavBar';
import TransparentButton from '../../Components/TransparentButton/TransparentButton';
import Profile from '../../Components/PauseScreens/Profile';

const PauseOverlay = ({ text }) => {
    const [profileView, setProfileView] = useState(false);
    const [controlsView, setControlsView] = useState(false);
    const [leaderBoardView, setLeaderBoardView] = useState(false);
    // const [profileView, setProfileView] = useState(null);

    // @TODO MAKE LOGOUT BADDIE
    return (
        <div id='pause-overlay'>
            <NavBar
                profileClick={setProfileView}
                controlsClick={setControlsView}
                leaderBoardClick={setLeaderBoardView}
            />
            {!profileView && (<span id='pause-text'>Paused</span>)}
            {profileView && (<Profile />)}
            <div id='restart-div'>
                <TransparentButton
                    color='#c2b5b5'
                    hoverColor='#261D20'
                    type='button'
                    value='Restart'
                    onClick={() => console.log('clicked Restart')}
                />
            </div>
        </div>
    );
}

export default PauseOverlay;