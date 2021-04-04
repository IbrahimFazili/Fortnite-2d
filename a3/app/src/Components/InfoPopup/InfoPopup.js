import { useEffect, useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const InfoPopup = ({ msg, severity, open, onClose, autoHideDuration = 5000 }) => {

    const [_open, setOpen] = useState(false);
    useEffect(() => {
        setOpen(open);
    }, [open]);
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
        onClose();
    };

    return (
        <Snackbar open={_open} autoHideDuration={autoHideDuration} onClose={handleClose}>
            <Alert onClose={handleClose} severity={severity}>
                {msg}
            </Alert>
        </Snackbar>
    );
}

export default InfoPopup;
