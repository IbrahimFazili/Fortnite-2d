import { useState } from 'react';
import './App.css';
import { initSocketConnection, setPauseCallback, setInventoryCallback } from './controllers/main';
import GameView from './Containers/Game/GameView';
import Home from './Containers/Home/Home';
import InfoPopup from './Components/InfoPopup/InfoPopup';
import PauseOverlay from './Containers/PauseOverlay/PauseOverlay';
import { randint } from './models/utils';

function App() {

  const [showGame, setShowGame] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inventory, setInventory] = useState(null);
  const [successPopup, setSuccessOpen] = useState(false);
  // random number to force component to re-render. React doesn't detect changed props
  // for complex objects
  const [inventoryUpdater, setInventoryUpdater] = useState(1);
  setPauseCallback(_paused => setPaused(_paused));
  setInventoryCallback((_inventory) => {
    setInventory(_inventory);
    setInventoryUpdater(1 + randint(1000));
  });

  return (
    <div className="App">
      {!showGame &&
        <Home
          onLogin={(username) => {
            setShowGame(true);
            initSocketConnection(username)
          }}
          onRegister={() => setSuccessOpen(true)}
        />}
      {showGame && inventoryUpdater && <GameView inventory={inventory} />}
      {showGame && paused && (<PauseOverlay text='Paused' />)}
      <InfoPopup
        msg={'Registration Success!'}
        severity='success'
        open={successPopup}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}

export default App;
