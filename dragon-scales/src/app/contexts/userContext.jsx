"use client"

import React, { createContext, useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { defaultUserColors } from '@/app/constants';
import SelectUserDialog from '@/app/components/dialogs/SelectUserDialog';
import {getUsers, setUserColor} from "@/app/calls";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    
    const [userList, setUserList] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [selectUserDialogOpen, setSelectUserDialogOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };
    // Fetches initial users from backend.
    useEffect(() => {
        const fetchInitialUsers = async () => {
            try {
                const data = await getUsers();
                if (data === null) {
                    setSnackbarOpen(true);
                } else {
                    // Assign default colors to users who don't have a color
                    data.forEach(user => {
                        if (user.profile_color === "") {
                            const randomColor = defaultUserColors[Math.floor(Math.random() * defaultUserColors.length)];
                            const colorStatus = setUserColor(user.email, randomColor);
                            if (colorStatus === null) {
                                setSnackbarOpen(true);
                            }
                        }
                    });
                    setUserList(data);
                }
            } catch (error) {
                console.error(error.message);
                setSnackbarOpen(true);
            }
        };

        fetchInitialUsers();
    }, []);

    // Activates user dialog selection if no user is active.
    useEffect(() => {
        if (activeUsers.length === 0) {
            setSelectUserDialogOpen(true);
        }
    }, [userList, activeUsers]);

    return <UserContext.Provider value={{ 
        userList,
        setUserList,
        activeUsers,
        setActiveUsers }}>
        {children}
        <SelectUserDialog
            userList={userList}
            activeUsers={activeUsers}
            setActiveUsers={setActiveUsers}
            open={selectUserDialogOpen}
            setOpen={setSelectUserDialogOpen}
            onClose={() => setSelectUserDialogOpen(false)}
        />
        <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    Error retrieving users. Please reload the page and try again.
                </Alert>
        </Snackbar>
        </UserContext.Provider>;
};





