
"use client";

import Draggable from 'react-draggable';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper
} from "@mui/material";

function PaperComponent(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}

export default function DeleteEntityDialog({ entityName, open, onClose, onDelete }) {
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            onDelete();
        }
    };

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={onClose}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
            onKeyDown={handleKeyDown}
        >
            <DialogTitle id="draggable-dialog-title">Delete Entity</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete <em>{entityName}</em>? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onDelete} color="error">Delete</Button>
            </DialogActions>
        </Dialog>
    );
}
