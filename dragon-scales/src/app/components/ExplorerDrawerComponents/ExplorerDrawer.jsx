"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useContext, useRef } from "react";
import {Drawer, Typography, Stack} from "@mui/material";
import { styled } from "@mui/material/styles";

import {getLibraryStructure} from "@/app/calls";
import NotebookAccordion from "@/app/components/ExplorerDrawerComponents/NotebookAccordion";
import { EntitiesRefContext } from "@/app/contexts/entitiesRefContext";



const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'drawerWidth' })(({ theme, drawerWidth }) => ({
    position: "relative",
    anchor: "left",
    height: "100%",
    width: drawerWidth,
    flexShrink: 0,
    backgroundColor: "transparent",
    borderRadius: "16px",
    border: "none",

    "& .MuiDrawer-paper": {
        width: drawerWidth,
        boxSizing: "border-box",
        position: "sticky",
        top: 20,
        paddingBottom: 20,  
        height: "100vh",
        backgroundColor: "transparent",
        border: "none",
        borderRadius: "16px",
    },
}));


export default function ExplorerDrawer({library, open, onClose, drawerWidth, updateTrees}) {

    const router = useRouter();

    const [libraryStructure, setLibraryStructure] = useState([]);

    const selectedEntityRef = useRef("");
    const { entitiesRef } = useContext(EntitiesRefContext);


    const handleEntitySelect = (event, entityId) => {
        if (entityId) {
            selectedEntityRef.current = entityId; // Immediately update the state
            router.push(`${window.location.pathname}#${entityId}`, { scroll: false });
            if (entitiesRef.hasOwnProperty(entityId)) {
                entitiesRef[entityId].ref.current.scrollIntoView({behavior: "smooth", block: "start"});
            }
        } else {
            selectedEntityRef.current = ""; // Immediately update the state
            router.push(window.location.pathname, { scroll: false });
        }
    }



    // Loads the initial library structure
    useEffect(() => {
        getLibraryStructure(library.ID).then(data => {
            if (data) {
                setLibraryStructure(data);
            } else {
                setLibraryStructure(null);
            }
        });
    }, [library, updateTrees]);

    useEffect(() => {
        // Function to parse hash from URL
        const getHashFromUrl = () => {
            const hash = window.location.hash;
            return hash ? hash.slice(1) : '';
        };

        // Handle hash changes
        const handleHashChange = () => {
            selectedEntityRef.current = getHashFromUrl();
        };

        // Set initial value
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Listen for popstate events (browser back/forward)
        window.addEventListener('popstate', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('popstate', handleHashChange);
        };
    }, []);

    return(
        <StyledDrawer variant="persistent" open={open} onClose={onClose} drawerWidth={drawerWidth}>

            {libraryStructure === null ? (
                <Typography variant="h3">Error getting Library, please reload.</Typography>
            ) : Object.keys(libraryStructure).length === 0 ? (
                <Typography variant="h6">Loading...</Typography>
            ) : (
                <Stack flexGrow={2} spacing={1}>
                    {libraryStructure.children && libraryStructure.children.map(child => (
                        <NotebookAccordion key={child.id + "-NotebookAccordion"} notebookStructure={child} onSelectedItemsChange={handleEntitySelect} selectedEntity={selectedEntityRef.current} />
                    ))}
                </Stack>
            )}
        </StyledDrawer>
    )

}




