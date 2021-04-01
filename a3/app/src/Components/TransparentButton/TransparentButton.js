import { useState } from 'react';
import './TransparentButton.css';

const TransparentButton = ({
    color,
    hoverColor,
    type,
    value,
    onClick
}) => {

    const [hovering, setHovering] = useState(false);

    const hoverCSS = {
        borderColor: color,
        backgroundColor: color,
        color: hoverColor
    };

    const normalCSS = {
        borderColor: color,
        color: color
    };

    return (
        <input
        className="transparent-btn"
        type={type}
        value={value}
        onClick={onClick}
        onMouseOver={() => setHovering(true)}
        onMouseOut={() => setHovering(false)}
        style={hovering ? hoverCSS : normalCSS}
        />
    );
}

export default TransparentButton;
