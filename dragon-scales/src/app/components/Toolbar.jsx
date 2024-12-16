"use client"

import Link from 'next/link';
import {styled} from '@mui/material/styles';
import { Box, SvgIcon, IconButton } from "@mui/material";

import LogoIcon from './logo';


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
    backgroundColor: theme.palette.primary.main,
}));

export default function Toolbar() {


    return (
        <VerticalBar>
            <Link href="/">
                <HomeButton>
                    <SvgIcon component={LogoIcon} />
                </HomeButton>
            </Link>
        </VerticalBar>
    );

}










