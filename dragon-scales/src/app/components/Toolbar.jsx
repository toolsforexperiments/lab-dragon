"use client"

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useContext, useState, useEffect} from 'react';
import {styled} from '@mui/material/styles';
import { Box, SvgIcon, IconButton, Button, Stack } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';

import ToolbarAvatarGroup from './ToolbarAvatarGroup';
import LogoIcon from './icons/Logo';
import DenLogo from './icons/DenLogo';
import {LibraryIcon} from './icons/EntityIcons';

import {getLibraries} from "@/app/calls";

import {UserContext} from '../contexts/userContext';
import NewLibraryDialog from "@/app/components/dialogs/NewLibraryDialog";


const VerticalBar = styled(Box)(( {theme }) => ({
    position: 'fixed',
    width: '68px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 4000,
    backgroundColor: theme.palette.primary.darker,
}));

const HomeButton = styled(IconButton)(({theme}) => ({
    width: '42px',
    height: '42px',
    marginTop: '12px',
    marginBottom: '36px',
    backgroundColor: theme.palette.primary.main,
}));

const ToolbarButton = styled(Button, { shouldForwardProp: (prop) => prop !== 'isActive' }) (
    ({ theme, isActive }) => ({
        width: '42px',
        height: '42px',
        padding: '0px',
        minWidth: '42px',
        color: isActive ? theme.palette.primary.darker : theme.palette.primary.main,
        backgroundColor: isActive ? theme.palette.primary.light : theme.palette.background.default,
        boxShadow: theme.shadows[2],
        '&:hover': {
            boxShadow: theme.shadows[4],
            color: theme.palette.primary.darker,
            backgroundColor: theme.palette.primary.light,
        },
    }
));


export default function Toolbar() {
    const pathname = usePathname();
    const [libraries, setLibraries] = useState([]);

    const [openLibraryDialog, setOpenLibraryDialog] = useState(false);

    // Add 1 to this integer to trigger a reload of the Libraries
    const [triggerReload, setTriggerReload] = useState(0);

    const { activeUsers } = useContext(UserContext);




    const reloadLibraries = () => {
        setTriggerReload(triggerReload + 1);
    };

    useEffect(() => {
        getLibraries().then((data) => {
            setLibraries(data);
        });
    }, [triggerReload])


    return (
        <VerticalBar>
            
            {/* Home Button */}
            <Link href="/">
                <HomeButton title="Home">
                    <SvgIcon component={LogoIcon} />
                </HomeButton>
            </Link>

            <Stack justifyContent="center" spacing={2}>
                {Object.entries(libraries).map(([key, value]) => {
                    return (    
                        <Link key={value} href={`/library/${value}`}>
                            <ToolbarButton title={key} isActive={pathname === `/library/${value}`}>
                                <LibraryIcon />
                            </ToolbarButton>
                        </Link>
                    )
                })}

                <ToolbarButton title="Data Den">
                    <DenLogo />
                </ToolbarButton>

                <ToolbarButton title="Search">
                    <SearchIcon/>
                </ToolbarButton>

                <ToolbarButton title="Add New Library" onClick={() => setOpenLibraryDialog(true)}>
                    <AddBoxOutlinedIcon/>
                </ToolbarButton>

            </Stack>

            <ToolbarAvatarGroup activeUsers={activeUsers} />

            <NewLibraryDialog open={openLibraryDialog} onClose={()=>setOpenLibraryDialog(false)} reloadParent={reloadLibraries}/>


        </VerticalBar>
    );

}










