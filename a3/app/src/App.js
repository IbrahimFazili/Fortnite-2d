import { useState } from 'react';
import './App.css';
import { initSocketConnection } from './controllers/main';
import GameView from './Containers/Game/GameView';
import Home from './Containers/Home/Home';

function App() {

  const [showGame, setShowGame] = useState(false);
  return (
    <div className="App">
      {!showGame && <Home onLogin={(username) => {
        setShowGame(true);
        initSocketConnection(username)
      }} />}
      {showGame && <GameView />}
    </div>
  );
}

export default App;
