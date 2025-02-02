"use client"

import {Box, Typography, TextField, Stack, Button, Snackbar, Alert} from "@mui/material";
import {useContext, useState} from "react";
import {UserContext} from "@/app/contexts/userContext";
import {createBucket} from "@/app/calls";

export default function DataDen() {
    const {activeUsersEmailStr} = useContext(UserContext);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        try {
            const success = await createBucket(
                formData.get('name'),
                // activeUsersEmailStr,
                formData.get('location')
            );

            if (success === null) {
                setSnackbar({
                    open: true,
                    message: 'Could not find location for the bucket, either create the specified location or select an existing one.',
                    severity: 'error'
                });
                return;
            }
            
            if (!success) {
                throw new Error('Failed to create bucket');
            }
            
            setSnackbar({
                open: true,
                message: 'Bucket created successfully!',
                severity: 'success'
            });
            
            // Clear form
            event.target.reset();
            
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error creating bucket. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar(prev => ({...prev, open: false}));
    };

    return(
        <Box sx={{marginLeft: 2}}>
            <Typography variant="h1">Data Den</Typography>

            <Typography variant="h4" sx={{mt: 3, mb: 2}}>Add a new Data Bucket:</Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{maxWidth: 500}}>
                <Stack spacing={3}>
                    <TextField
                        required
                        fullWidth
                        autoComplete="off"
                        name="name"
                        label="Bucket Name"
                        variant="outlined"
                    />
                    <TextField
                        required
                        fullWidth
                        autoComplete="off"
                        name="location"
                        label="Location"
                        variant="outlined"
                    />
                    <Button 
                        type="submit"
                        variant="contained"
                        sx={{mt: 2}}
                    >
                        Create Bucket
                    </Button>
                </Stack>
            </Box>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{width: '100%'}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}





