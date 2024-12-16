import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import React from "react";


export default function ErrorSnackbar({ open, message, onClose }) {
return (
    <Snackbar open={open}
              autoHideDuration={6000}
              onClose={onClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={onClose} severity="error" sx={{ width: '100%' }}>
            {message}
        </Alert>
    </Snackbar>
    );
}








