"use client"

import { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Paper
} from "@mui/material";
import { updateEntity } from "@/app/utils";

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

export default function EditEntityDialog({ 
    user, 
    type, 
    entityName, 
    entityID,
    parentID,
    parentName,
    open, 
    onClose, 
    reloadParent 
}) {
    const [name, setName] = useState(entityName);
    const [error, setError] = useState("");

    // Reset the name when the dialog opens with a new entity
    useEffect(() => {
        setName(entityName);
    }, [entityName]);

    const handleClose = () => {
        setName(entityName); // Reset to original name
        setError("");
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate input
        if (!name.trim()) {
            setError("Name cannot be empty");
            return;
        }

        // Don't submit if name hasn't changed
        if (name === entityName) {
            handleClose();
            return;
        }

        try {
            const updates = { 
                new_name: name,
                parent: parentID 
            };
            
            const success = await updateEntity(
                entityID,
                updates,
                user,
                false, // isNewEntity
                false  // isDeleted
            );
            
            if (success) {
                await reloadParent();
                handleClose();
            } else {
                setError("Failed to update name");
            }
        } catch (error) {
            console.error("Error updating entity name:", error);
            setError(`Error updating name: ${error.message}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
        setError(""); // Clear error when user types
    };

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={handleClose}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
        >
            <DialogTitle 
                style={{ cursor: 'move' }} 
                id="draggable-dialog-title"
            >
                Edit {type} Name
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <DialogContentText>
                        Enter new name for <b><em>{entityName}</em></b> in <b>{parentName}</b>:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="name"
                        label={`${type} Name`}
                        type="text"
                        fullWidth
                        variant="standard"
                        value={name}
                        onChange={handleNameChange}
                        onKeyDown={handleKeyDown}
                        error={!!error}
                        helperText={error}
                        autoComplete="off"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        type="submit"
                        disabled={!name.trim() || name === entityName}
                    >
                        Save
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}