import './TransparentInput.css';

const TransparentInput = ({
    label,
    labelStyle,
    color,
    type,
    onChange,
    autocomplete='off',
    required=false,
    autofocus=false
}) => {
    return (
        <div>
            <span style={labelStyle}>{label}</span>
            <br /><br />
            <input
            className="transparent-input"
            type={type}
            autoComplete={autocomplete}
            required={required}
            autoFocus={autofocus}
            onChange={onChange}
            style={{
                color,
                borderColor: color
            }}
            />
        </div>
    );
}

export default TransparentInput;
