import { useState } from 'react';
import './App.css';
import { initSocketConnection, setPauseCallback, setInvetoryCallback } from './controllers/main';
import GameView from './Containers/Game/GameView';
import Home from './Containers/Home/Home';

function App() {

  const [showGame, setShowGame] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inventory, setInventory] = useState(null);
  setPauseCallback(_paused => setPaused(_paused));
  setInvetoryCallback((_inventory) => setInventory(_inventory));

  return (
    <div className="App">
      {!showGame && <Home onLogin={(username) => {
        setShowGame(true);
        initSocketConnection(username)
      }} />}
      {showGame && <GameView paused={paused} inventory={inventory}/>}
    </div>
  );
}

export default App;
