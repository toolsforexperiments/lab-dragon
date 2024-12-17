"use client"

import Link from 'next/link';
import {useContext} from 'react';
import {styled} from '@mui/material/styles';
import { Box, SvgIcon, IconButton, Button, Stack } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

import ToolbarAvatarGroup from './ToolbarAvatarGroup';
import LogoIcon from './icons/Logo';
import DenLogo from './icons/DenLogo';

import {UserContext} from '../contexts/userContext';


const VerticalBar = styled(Box)(( {theme }) => ({
    position: 'fixed',
    width: '68px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: theme.palette.primary.darker,
}));

const HomeButton = styled(IconButton)(({theme}) => ({
    width: '42px',
    height: '42px',
    marginTop: '12px',
    marginBottom: '36px',
    backgroundColor: theme.palette.primary.main,
}));

const ToolbarButton = styled(Button)(({theme}) => ({
    width: '42px',
    height: '42px',
    padding: '0px',
    minWidth: '42px',
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.contrast,
    boxShadow: theme.shadows[2],
    '&:hover': {
        boxShadow: theme.shadows[4],
        backgroundColor: theme.palette.primary.light,
    },
}));

export default function Toolbar() {
    const { activeUsers } = useContext(UserContext);

    return (
        <VerticalBar>
            
            {/* Home Button */}
            <Link href="/">
                <HomeButton title="Home">
                    <SvgIcon component={LogoIcon} />
                </HomeButton>
            </Link>

            <Stack justifyContent="center" spacing={2}>
                <ToolbarButton title="Data Den">
                    <DenLogo />
                </ToolbarButton>
                <ToolbarButton title="Search">
                    <SearchIcon/>
                </ToolbarButton>
            </Stack>


            <ToolbarAvatarGroup activeUsers={activeUsers} />
        </VerticalBar>
    );

}










