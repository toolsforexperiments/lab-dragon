"use client"

import { useState } from "react";
import Draggable from 'react-draggable';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Paper, Box, Snackbar, Alert} from "@mui/material";

import {createLibrary} from "@/app/utils";

function PaperComponent(props) {
    return (
      <Draggable
        handle="#draggable-dialog-title"
        cancel={'[class*="MuiDialogContent-root"]'}
      >
        <Paper {...props} />
      </Draggable>
    );
  }

export default function NewLibraryDialog({ user, open, onClose, reloadParent }) {


    const [errorMessage, setErrorMessage] = useState("");
    const [openErrorSnack, setOpenErrorSnack] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await createLibrary(e.target.name.value, user);
        if (success === true) {
            reloadParent();
            onClose();
        } else {
            setErrorMessage(success);
            setOpenErrorSnack(true);
        }
    }


    return (
        <Box>
            <Dialog
                fullWidth
                open={open}
                onClose={onClose}
                PaperComponent={PaperComponent}
                aria-labelledby="draggable-dialog-title"
                PaperProps={{
                    component: 'form',
                    onSubmit: (e) => {
                        handleSubmit(e);
                    }
                }}
            >
                <DialogTitle>Add New <em>Library</em></DialogTitle>
                <DialogContent>
                    <DialogContentText>Please enter name of the new <em>Library</em></DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="name"
                        label={`New Library Name`}
                        type="text"
                        fullWidth
                        variant="standard"
                        autoComplete="off"
                        />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit">Create</Button>
                </DialogActions>
                <Snackbar 
                    sx={{zIndex: 1400}}
                    open={openErrorSnack}
                    onClose={() => setOpenErrorSnack(false)}
                    autoHideDuration={6000}
                >
                    <Alert onClose={() => setOpenErrorSnack(false)} severity="error" sx={{ width: '100%' }}>
                        {errorMessage}
                    </Alert>
                </Snackbar>
            </Dialog>
            
        </Box>
    )
}





