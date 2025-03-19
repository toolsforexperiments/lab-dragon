"use client"

import { useState, useContext } from "react";
import { Box, Tooltip, Avatar, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

import LDAvatar from './AvatarStyled';
import {usePathname} from "next/navigation";
import {UserContext} from "@/app/contexts/userContext";


const StyledVerticalAvatars = styled(Button)(({ theme }) => ({
    width: '50px',
    minWidth: '50px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    marginTop: 'auto',
    marginBottom: '12px',
    '&:hover': {
        boxShadow: theme.shadows[6],
    },
}));

export default function ToolbarAvatarGroup({ activeUsers }) {
    const userEntries = Object.entries(activeUsers);
    const displayUsers = userEntries.slice(0, 3);
    const extraUsers = userEntries.slice(3);
    const extraCount = extraUsers.length;
    const extraNames = extraUsers.map(([_, value]) => value.name).join(', ');

    const {setSelectUserDialogOpen} = useContext(UserContext);

    return (
        <Box sx={{
                marginTop: 'auto',  // This pushes it to the bottom
                marginBottom: '12px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
        }}>
            <StyledVerticalAvatars title="Change Users" onClick={() => setSelectUserDialogOpen(true)}>
                {extraCount > 0 && (
                    <Tooltip title={extraNames}>
                        <Avatar key="extra" name={`+${extraCount}`} alt={`+${extraCount}`}>
                            +{extraCount}
                        </Avatar>
                    </Tooltip>
                )}
                {displayUsers.map(([key, value]) => (
                    <LDAvatar key={key + "-LDAvatar"} bgColor={value.profile_color} name={value.name} alt={value.name} />
                ))}
            </StyledVerticalAvatars>
        </Box>
    );
}



