"use client"

import { useState } from 'react';
import Draggable from 'react-draggable';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Paper,
    Snackbar, Alert
} from "@mui/material";


import UserSelect from "@/app/components/UserSelect";

function PaperComponent(props) {
    return (
      <Draggable
        handle="#draggable-dialog-title"
        cancel={'[class*="MuiDialogContent-root"]'}
      >
        <Paper {...props} />
      </Draggable>
    );
  };

export default function SelectUserDialog({ userList, activeUsers, setActiveUsers, open, setOpen, onClose}) {

    const [openSnackBar, setOpenSnackBar] = useState(false);

    const handleCloseSnackbar = () => {
        setOpenSnackBar(false);
    }

    const handleBackgroundClick = (event) => {
        event.stopPropagation();
    }

    const handleCloseDialog = () => {
        if (Object.keys(activeUsers).length === 0) {
            setOpenSnackBar(true);
        } else {
            setOpen(false);
        }
    }

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={handleBackgroundClick}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
        >
            <DialogTitle>Select User</DialogTitle>
            <DialogContent>
                <UserSelect userList={userList} activeUsers={activeUsers} setActiveUsers={setActiveUsers}/>
            </DialogContent>
            <DialogActions>
                <Button type="submit" onClick={handleCloseDialog}>Done</Button>
            </DialogActions>
            <Snackbar open={openSnackBar}
                      autoHideDuration={6000}
                      onClose={handleCloseSnackbar}>
                <Alert severity="error">
                    Please select at least one user
                </Alert>
            </Snackbar>
        </Dialog>
    );
};
























