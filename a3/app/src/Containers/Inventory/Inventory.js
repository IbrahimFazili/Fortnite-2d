import { useEffect, useState } from "react";
import EmptyWeaponView from "../../Components/InventoryWeaponView/EmptyWeaponView";
import WeaponView from "../../Components/InventoryWeaponView/WeaponView";
import './Inventory.css';

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
    let ammoAdded = false;
    for (const key in inventory) {
        if (key === 'weapons') continue;
        if (key.search('ammo') !== -1 && !ammoAdded) {
            if (inventory.weapons.length === 0) continue;
            const reserves = inventory[`${inventory.weapons[inventory.equippedWeapon].label}ammo`];
            items.push((
                <span>{`Ammo: ${inventory.weapons[inventory.equippedWeapon].currentAmmo} / ${reserves}`}</span>
            ));
            ammoAdded = true;
        }
        else {
            items.push((
                <span>{`${_capitalize(key)}: ${inventory[key]}`}</span>
            ));
        }

    }

    return items;
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
            </div>
        </div>);
}

export default Inventory;
