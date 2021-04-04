import { useEffect, useState } from "react";
import EmptyWeaponView from "../../Components/InventoryWeaponView/EmptyWeaponView";
import WeaponView from "../../Components/InventoryWeaponView/WeaponView";
import './Inventory.css';

function buildWeaponViewList(_inventory) {
    if (!_inventory) return null;
    let weapons = [];
    let id = 0;
    _inventory.weapons.forEach((w, i) => {
        const selected = i === _inventory.equippedWeapon;
        weapons.push((
            <WeaponView
                selected={selected}
                weapon={w.label}
                key={id}
            />
        ));

        id++;
    });


    for (let i = 0; i < _inventory.maxWeaponSlots - _inventory.weapons.length; i++) {
        weapons.push((<EmptyWeaponView key={id} />));
        id++;
    }

    return weapons;
}

const Inventory = ({ inventory }) => {

    const [_inventory, setInventory] = useState(null);
    useEffect(() => {
        setInventory(inventory);
    }, [inventory]);

    return (
        <div id='inventory'>
            <div style={{ alignSelf: 'flex-end', display: 'flex' }}>
                {buildWeaponViewList(_inventory)}
            </div>
        </div>);
}

export default Inventory;
