import { useEffect, useState } from 'react';
import PauseOverlay from '../PauseOverlay/PauseOverlay';
import Inventory from '../Inventory/Inventory';

const GameView = ({paused, inventory}) => {

    const [_paused, setPaused] = useState(false);
    const [_inventory, setInventory] = useState(null);
    useEffect(() => {
        setPaused(paused);
    }, [paused]);

    useEffect(() => {
        setInventory(inventory);
        console.count('Passing updated props');
    }, [inventory]);
    
    return (
        <div>
            {_paused && (<PauseOverlay text='Paused' />)}
            <canvas
            id="stage"
            width="400"
            height="400"
            style={{
                display: 'block',
                margin: '0%',
                padding: '0%',
            }}
            >
            </canvas>
            <Inventory inventory={_inventory}/>
        </div>
    );
}

export default GameView;
