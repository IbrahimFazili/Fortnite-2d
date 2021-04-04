import './InventoryWeaponView.css';
import ARImage from '../../assets/AR.png';
import SMGImage from '../../assets/SMG.png';

const ASSET_MAP = {
    'AR': ARImage,
    'SMG': SMGImage
};

const WeaponView = ({ weapon, selected }) => {

    return (
        <img
            src={ASSET_MAP[weapon]}
            className={`weapon-img ${selected ? 'weapon-selected' : ''}`}
        />
    );
}

export default WeaponView;
