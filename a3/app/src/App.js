import { useState } from 'react';
import './App.css';
import { initSocketConnection, disconnectSocket, setPauseCallback, setInventoryCallback } from './controllers/main';
import GameView from './Containers/Game/GameView';
import Home from './Containers/Home/Home';
import InfoPopup from './Components/InfoPopup/InfoPopup';
import PauseOverlay from './Containers/PauseOverlay/PauseOverlay';
import { randint } from './models/utils';

function App() {

  const [userName, setUserName] = useState(null);
  const [showGame, setShowGame] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inventory, setInventory] = useState(null);
  const [successPopup, setSuccessOpen] = useState(false);
  const [err, setErr] = useState('');
  const [showErr, setShowErr] = useState(false);
  // random number to force component to re-render. React doesn't detect changed props
  // for complex objects
  const [inventoryUpdater, setInventoryUpdater] = useState(1);
  const [playerAlive, setPlayerAlive] = useState(true);
  setPauseCallback(_paused => setPaused(_paused));
  setInventoryCallback((_inventory) => {
    setInventory(_inventory);
    setInventoryUpdater(1 + randint(1000));
  });

  function logoutClick() {
    setShowGame(false);
    setPaused(false);
    localStorage.removeItem('auth');
    disconnectSocket();
  }

  function restartClick() {
    disconnectSocket();
    initSocketConnection(userName, () => setPlayerAlive(false), handleError);
    setPlayerAlive(true);
  }

  function handleError(e) {
    setErr(e);
    setShowErr(true);
  }

  return (
    <div className="App">
      {!showGame &&
        <Home
          onLogin={(username) => {
            setShowGame(true);
            setUserName(username);
            initSocketConnection(username, () => setPlayerAlive(false), handleError)
          }}
          onRegister={() => setSuccessOpen(true)}
        />}
      {showGame && inventoryUpdater && <GameView inventory={inventory} />}
      {showGame && (paused || !playerAlive) &&
      (<PauseOverlay
      text={playerAlive ? 'Paused' : 'Game Over'}
      logoutClick={logoutClick}
      restartClick={restartClick}
      />)}
      <InfoPopup
        msg={'Registration Success!'}
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

export default App;
