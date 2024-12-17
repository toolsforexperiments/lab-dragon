"use client";

import { useState } from "react";
import { Drawer, Typography, DrawerHeader } from "@mui/material";
import { styled } from "@mui/material/styles";






const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'drawerWidth' })(({ theme, drawerWidth }) => ({
    position: "relative",
    anchor: "left",
    height: "100%",
    width: drawerWidth,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
        width: drawerWidth,
        boxSizing: "border-box",
        position: "relative",
    },
}));


export default function ExplorerDrawer({open, onClose, drawerWidth}) {

    return(
        <StyledDrawer variant="persistent" open={open} onClose={onClose} drawerWidth={drawerWidth}>

            <Typography variant="h6">Explorer</Typography>

        </StyledDrawer>
    )

}




