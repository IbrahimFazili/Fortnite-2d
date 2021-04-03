import './InventoryWeaponView.css';

const ASSET_PATHS = {
    'AR': '../../assets/AR.png',
    'SMG': '../../assets/SMG.png'
};

const WeaponView = ({ weapon, selected }) => {

    return (
        <img
            src={ASSET_PATHS[weapon]}
            className={`weapon-img ${selected ? 'weapon-selected' : ''}`}
        />
    );
}

export default WeaponView;
