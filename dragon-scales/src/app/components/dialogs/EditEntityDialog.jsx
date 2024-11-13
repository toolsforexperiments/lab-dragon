import React from 'react';
import Draggable from 'react-draggable';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Paper } from "@mui/material";
import { updateEntity } from "@/app/utils";

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export default function EditEntityDialog({ user, type, entityName, entityID, open, onClose, reloadParent }) {
  const [newName, setNewName] = React.useState('');

  const handleSaveOnEnter = (e) => {
    if (e.key === 'Enter') {
      handleUpdateEntity();
    }
  };

  const handleUpdateEntity = async () => {
    try {
      const updates = { new_name: newName };
      const success = await updateEntity(entityID, updates, user);
      if (success) {
        reloadParent();
        onClose();
      }
    } catch (error) {
      console.error("Error updating entity:", error);
      alert(`Failed to update ${type} name: ${error.message}`);
    }
  };

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
          handleUpdateEntity();
        },
      }}
    >
      <DialogTitle id="draggable-dialog-title">Edit {type}</DialogTitle>
      <DialogContent>
        <DialogContentText>Please enter the new name for the {type}</DialogContentText>
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
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleSaveOnEnter}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={!newName.trim() || newName === entityName}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}