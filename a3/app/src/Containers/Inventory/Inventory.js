import { useEffect, useState } from "react";
import EmptyWeaponView from "../../Components/InventoryWeaponView/EmptyWeaponView";
import WeaponView from "../../Components/InventoryWeaponView/WeaponView";
import './Inventory.css';
import BrickImage from '../../assets/brick.png';
import Steel from '../../assets/iron.png';

/**
 * Capitalize the first character of the given string
 * @param {string} s 
 * @returns {string}
 */
function _capitalize(s) {
    return `${s.charAt(0).toUpperCase()}${s.substr(1)}`;
}

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

function buildInvetory(inventory) {
    const items = [];
    if (!inventory) return;
    items.push((
        <div>
            <img src={BrickImage} style={{ height: '3em' }} />
            <span style={{ fontSize: '2em' }}>
                &nbsp;&nbsp;&nbsp;{`${inventory.brick}`}
            </span>
        </div>)
    );
    items.push((
        <div>
            <img src={Steel} style={{ height: '3em' }} />
            <span style={{ fontSize: '2em' }}>
                &nbsp;&nbsp;&nbsp;{`${inventory.steel}`}
            </span>
        </div>)
    );

    return items;
}

function getAmmo(inventory) {
    if (!inventory) return;
    if (inventory.weapons.length === 0) return;
    const reserves = inventory[`${inventory.weapons[inventory.equippedWeapon].label}ammo`];
    return ((
        <span style={{ fontSize: '2em' }}>
            {`${inventory.weapons[inventory.equippedWeapon].currentAmmo} / ${reserves}`}
        </span>
    ));
}

const Inventory = ({ inventory }) => {

    const [_inventory, setInventory] = useState(null);
    useEffect(() => {
        setInventory(inventory);
    }, [inventory]);

    return (
        <div id='inventory'>
            <div className='inventory-top-items'>
                {buildInvetory(_inventory)}
            </div>
            <div className='inventory-weapons'>
                {buildWeaponViewList(_inventory)}
                <div style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}>
                    {getAmmo(_inventory)}
                </div>
            </div>
        </div>);
}

export default Inventory;
