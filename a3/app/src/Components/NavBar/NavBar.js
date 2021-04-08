import TransparentButton from '../../Components/TransparentButton/TransparentButton';
import './NavBar.css';

const NavBar = ({profileClick, controlsClick, leaderBoardClick, logoutClick}) => {

    return (
        <div id='navbar'>
            <TransparentButton 
            color='#c2b5b5'
            hoverColor='#261D20'
            type='button'
            value='Profile'
            onClick={() =>
                {
                    profileClick(true);
                    controlsClick(false);
                    leaderBoardClick(false);
                } }
            />
            <TransparentButton 
            color='#c2b5b5'
            hoverColor='#261D20'
            type='button'
            value='Controls'
            onClick={() => {
                profileClick(false);
                controlsClick(true);
                leaderBoardClick(false);
            }}
            />
            <TransparentButton 
            color='#c2b5b5'
            hoverColor='#261D20'
            type='button'
            value='LeaderBoard'
            onClick={() => {
                profileClick(false);
                controlsClick(false);
                leaderBoardClick(true);
            }}
            />
            <TransparentButton 
            color='#c2b5b5'
            hoverColor='#261D20'
            type='button'
            value='Logout'
            onClick={() => {
                logoutClick();
            }}
            />
        </div>
    );
}

export default NavBar;