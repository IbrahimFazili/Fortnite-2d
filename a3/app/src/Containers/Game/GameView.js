import { useEffect, useState } from 'react';
import Inventory from '../Inventory/Inventory';

const GameView = ({ inventory }) => {
    const [_inventory, setInventory] = useState(null);

    useEffect(() => {
        setInventory(inventory);
    }, [inventory]);

    return (
        <div>
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
            <Inventory inventory={_inventory} />
        </div>
    );
}

export default GameView;
