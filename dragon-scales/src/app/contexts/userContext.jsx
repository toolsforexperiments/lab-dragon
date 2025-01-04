"use client"

import React, { createContext, useState, useEffect } from 'react';

import { defaultUserColors } from '@/app/constants';
import SelectUserDialog from '@/app/components/dialogs/SelectUserDialog';
import {getUsers, setUserColor} from "@/app/calls";
import ErrorSnackbar from "@/app/components/ErrorSnackbar";
import {getCookie, hasCookie, setCookie} from "cookies-next";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    
    const [userList, setUserList] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [activeUsersEmailStr, setActiveUsersEmailStr] = useState("");
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
                            } else {
                                user.profile_color = randomColor;
                            }
                        }
                    });

                    const selectedUserExists = hasCookie("lab_dragon_active_user");
                    if (selectedUserExists === true) {
                        const selectedUser = await getCookie("lab_dragon_active_user");
                        const selectedUserEmails = JSON.parse(selectedUser);
                        const selectedUsers = data.filter(user => selectedUserEmails.includes(user.email));
                        const selectedUsersMap = selectedUsers.reduce((acc, user) => {
                            const { email, ...rest } = user;
                            acc[email] = rest;
                            return acc;
                        }, {});
                        setActiveUsers(selectedUsersMap);
                    }
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
        const selectedUserExists = hasCookie("lab_dragon_active_user");
        if (selectedUserExists === true) {
            const selectedUser = getCookie("lab_dragon_active_user")
            return
        }
        if (activeUsers.length === 0) {
            setSelectUserDialogOpen(true);
        }
    }, [userList, activeUsers]);

    // Updates the email string
    useEffect(() => {
        const usersStr = JSON.stringify(Object.keys(activeUsers));
        setActiveUsersEmailStr(usersStr);
        if (Object.keys(activeUsers).length > 0) {
            setCookie("lab_dragon_active_user", usersStr);
        }
    }, [activeUsers]);


    return <UserContext.Provider value={{ 
        userList,
        setUserList,
        activeUsers,
        setActiveUsers,
        activeUsersEmailStr}}>
        {children}
        <SelectUserDialog
            userList={userList}
            activeUsers={activeUsers}
            setActiveUsers={setActiveUsers}
            open={selectUserDialogOpen}
            setOpen={setSelectUserDialogOpen}
            onClose={() => setSelectUserDialogOpen(false)}
        />
        <ErrorSnackbar open={snackbarOpen} message="Error retrieving users. Please reload the page and try again." onClose={handleCloseSnackbar} />
        </UserContext.Provider>;
};





