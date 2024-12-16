"use client"

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Select, MenuItem, Checkbox, ListItemText, Box, Chip } from '@mui/material';


import { getContrastTextColor } from '../utils';
import LDAvatar from './AvatarStyled';


const StyledUserSelect = styled(Select)(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.background.paper,
}));


const UserSelect = ({ userList, activeUsers, setActiveUsers}) => {

    // Active users are the user objects that are selected, the entire site uses that array.
    // Selected users is used to store simply the emails of the users that are selected and meant to be used for the select component.
    const [selectedUsers, setSelectedUsers] = useState([]);

    const handleChange = (event) => {

        const {
            target: { value },
        } = event;

        // sets internal state
        setSelectedUsers(value);

        // Gets the whole object instead of just emails
        const newActiveUsers = userList.filter(user => value.includes(user.email));
        const activeUsersMap = newActiveUsers.reduce((acc, user) => {
            const { email, ...rest } = user;
            acc[email] = rest;
            return acc;
        }, {});
        setActiveUsers(activeUsersMap);
    };
    
    return (
        <StyledUserSelect
            multiple
            value={selectedUsers}
            onChange={handleChange}
            renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                        <Chip key={value} label={activeUsers[value].name} sx={{ backgroundColor: activeUsers[value].profile_color, color: getContrastTextColor(activeUsers[value].profile_color) }} />
                    ))}
                </Box>
            )}
        >
            {userList.map((user) => (
                <MenuItem key={user.email} value={user.email}>
                    <Checkbox checked={selectedUsers.includes(user.email)} />
                    <ListItemText primary={user.name} secondary={user.email} />
                    <LDAvatar bgColor={user.profile_color} name={user.name} />
                </MenuItem>
            ))}
        </StyledUserSelect>
    );
};

export default UserSelect;

















