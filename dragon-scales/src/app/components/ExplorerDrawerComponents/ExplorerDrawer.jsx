"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {Drawer, Typography, Stack} from "@mui/material";
import { styled } from "@mui/material/styles";

import {getLibraryStructure} from "@/app/calls";
import NotebookAccordion from "@/app/components/ExplorerDrawerComponents/NotebookAccordion";


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


export default function ExplorerDrawer({libraryId, open, onClose, drawerWidth}) {

    const router = useRouter();
    const searchParams = useSearchParams();

    const [libraryStructure, setLibraryStructure] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState("")

    const handleEntitySelect = (event, entityId) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        
        if (entityId) {
            current.set("selected", entityId);
        } else {
            current.delete("selected");
        }
        router.push(window.location.pathname + "?" + current.toString());
    };

    // Loads the initial library structure
    useEffect(() => {
        getLibraryStructure(libraryId).then(data => {
            if (data) {
                setLibraryStructure(data);
            } else {
                setLibraryStructure(null);
            }
        });
    }, [libraryId]);

    // Updates the state variable to match the searchParams
    useEffect(() => {
        const selected = searchParams.get("selected");
        if (selected) {
            setSelectedEntity(selected);
        }
    }, [searchParams]);

    return(
        <StyledDrawer variant="persistent" open={open} onClose={onClose} drawerWidth={drawerWidth}>

            {libraryStructure === null ? (
                <Typography variant="h3">Error getting Library, please reload.</Typography>
            ) : Object.keys(libraryStructure).length === 0 ? (
                <Typography variant="h6">Loading...</Typography>
            ) : (
                <Stack flexGrow={1}>
                    <Typography variant="h6">Explorer</Typography>
                    <Stack spacing={2}>
                        {libraryStructure.children && libraryStructure.children.map(child => (
                            <NotebookAccordion notebookStructure={child} onSelectedItemsChange={handleEntitySelect} selectedEntity={selectedEntity} />
                        ))}
                </Stack>
            </Stack>
            )}
        </StyledDrawer>
    )

}




