"use client"

import {
    Checkbox,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    MenuList,
    Paper,
    Typography,
    Snackbar,
    Alert, Box
} from "@mui/material";
import {useEffect, useState} from "react";
import {getBuckets, targetBucket, unsetTargetBucket} from "@/app/calls";

export default function TargetingMenu({ entity }){
    const [buckets, setBuckets] = useState({});
    const [checked, setChecked] = useState(entity["data_buckets"]);
    // Split snackbar state into separate variables
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
    };

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            targetBucket(entity.ID, value)
                .then((response) => {
                    if (response === true) {
                        newChecked.push(value);
                        setChecked(newChecked);
                        setSnackbarMessage(`Successfully added to bucket: ${buckets[value]}`);
                        setSnackbarSeverity('success');
                        setIsSnackbarOpen(true);
                    } else {
                        setSnackbarMessage(`Error setting bucket target`);
                        setSnackbarSeverity('error');
                        setIsSnackbarOpen(true);
                    }
                })
                .catch((error) => {
                    setSnackbarMessage(`Error setting bucket target`);
                    setSnackbarSeverity('error');
                    setIsSnackbarOpen(true);
                });
        } else {
            console.log("Unsetting target bucket, ", value);
            unsetTargetBucket(entity.ID, value)
                .then((response) => {
                    if (response === true) {
                        newChecked.splice(currentIndex, 1);
                        setChecked(newChecked);
                        setSnackbarMessage(`Removed from bucket: ${buckets[value]}`);
                        setSnackbarSeverity('info');
                        setIsSnackbarOpen(true);
                    } else {
                        setSnackbarMessage(`Failed to remove from bucket`);
                        setSnackbarSeverity('error');
                        setIsSnackbarOpen(true);
                    }
                })
                .catch((error) => {
                    setSnackbarMessage(`Failed to remove from bucket`);
                    setSnackbarSeverity('error');
                    setIsSnackbarOpen(true);
                });
        }
    };

    // Loads the buckets
    useEffect(() => {
        getBuckets().then((response) => {
            if (response) {
                setBuckets(response);
            } else {
              console.error("Error getting buckets");
            }}).catch((error) => {
                console.error("Error getting buckets", error);
            });
    }, []);

    console.log(entity)
    console.log(checked)
    return (
        <Box>
            <Paper sx={{ width: 320, maxWidth: '100%' }}>
                <MenuList dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    {Object.entries(buckets).map(([key, value]) => (
                        <MenuItem key={key}>
                            <ListItemText primary={value} secondary={key} onClick={handleToggle(key)} />
                            <Checkbox edge="end" checked={checked.includes(key)} onChange={handleToggle(key)} />
                        </MenuItem>
                    ))}
                </MenuList>
            </Paper>
            
            <Snackbar 
                open={isSnackbarOpen} 
                autoHideDuration={6000} 
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbarSeverity} 
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}






