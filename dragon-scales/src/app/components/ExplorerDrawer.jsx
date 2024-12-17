"use client";

import { useState, useEffect } from "react";
import {Drawer, Typography, Accordion, Stack, AccordionSummary, AccordionDetails} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from "@mui/material/styles";

import {getLibraryStructure} from "@/app/calls";
import {EntityIcon} from "@/app/components/icons/EntityIcons";



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


const EntIcon = styled(EntityIcon)(({theme}) => ({
    color: theme.palette.primary.dark,
    marginRight: '10px',
}));


const NotebookAccordions = styled(Accordion)(({ theme }) => ({
    backgroundColor: theme.palette.background.notebookAccordion,
}));


export default function ExplorerDrawer({libraryId, open, onClose, drawerWidth}) {

    const [libraryStructure, setLibraryStructure] = useState([]);

    useEffect(() => {
        getLibraryStructure(libraryId).then(data => {
            if (data) {
                setLibraryStructure(data);
            } else {
                setLibraryStructure(null);
            }
        });
    }, [libraryId]);


    // TODO: Use expansion trigger to control expansion of tree in to just icon
    return(
        <StyledDrawer variant="persistent" open={open} onClose={onClose} drawerWidth={drawerWidth}>

            {libraryStructure === null ? (
                <Typography variant="h3">Error getting Library, please reload</Typography>
            ) : Object.keys(libraryStructure).length === 0 ? (
                <Typography variant="h6">Loading...</Typography>
            ) : (
                <Stack flexGrow={1}>
                    <Typography variant="h6">Explorer</Typography>
                    <Stack spacing={2}>
                        {libraryStructure.children && libraryStructure.children.map(child => (
                            <NotebookAccordions key={child.id}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                    <EntIcon type={child.type} />
                                    <Typography variant="h6">{child.name}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Stack>
                                        {child.children && child.children.map(subChild => (
                                            <Typography key={subChild.id} variant="body1">{subChild.name}</Typography>
                                        ))}
                                    </Stack>
                                </AccordionDetails>
                            </NotebookAccordions>
                        ))}
                </Stack>
            </Stack>
            )}
        </StyledDrawer>
    )

}




