"use client"

import { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
} from "@mui/material";


import UserSelect from "@/app/components/UserSelect";
import ErrorSnackbar from "@/app/components/ErrorSnackbar";

function PaperComponent(props) {
    return (
    <Paper {...props} />
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
            <ErrorSnackbar open={openSnackBar}
                           handleClose={handleCloseSnackbar}
                           message="Please select at least one user"/>
        </Dialog>
    );
};
























