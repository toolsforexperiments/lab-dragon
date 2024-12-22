"use client"

import { useState, useContext } from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Paper} from "@mui/material";


import {createEntity} from "@/app/calls";
import {UserContext} from "@/app/contexts/userContext";
import ErrorSnackbar from "@/app/components/ErrorSnackbar";

function PaperComponent(props) {
    return (
    <Paper {...props} />
    );
  }

export default function NewEntityDialog({ user, type, parentName, parentID,  open, onClose, reloadParent }) {
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Undefined error");

    const { activeUsersEmailStr } = useContext(UserContext);


    return (
        <Dialog
            fullWidth
            open={open}
            onClose={onClose}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
            PaperProps={{
                component: 'form',
                onSubmit: (e) => {
                    e.preventDefault();
                    const success = createEntity(e.target.name.value,
                        activeUsersEmailStr,
                        type,
                        parentID).then((response) => {
                        if (response === true) {
                            reloadParent();
                            onClose();
                        } else {
                            setErrorMessage("Error creating new entity");
                            setErrorSnackbarOpen(true);
                            console.error("Error creating new entity");
                        }
                    });
                }
            }}
            >
            <DialogTitle>Add New <em>{type}</em> to <b><em>{parentName}</em></b></DialogTitle>
            <DialogContent>
                <DialogContentText>Please enter name of new {type}</DialogContentText>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="name"
                    label={`New ${type} Name`}
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
            <ErrorSnackbar open={errorSnackbarOpen} message={errorMessage} onClose={() => setErrorSnackbarOpen(false)}/>
        </Dialog>
    )
}


































