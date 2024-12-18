"use client";
import { useEffect, useState, useRef } from "react";

import { Box, IconButton, Stack, Typography, Button } from "@mui/material";
import { Settings } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

import ErrorSnackbar from "@/app/components/ErrorSnackbar";
import { getEntity } from "@/app/calls";
import ExplorerDrawer from "@/app/components/ExplorerDrawerComponents/ExplorerDrawer";
import NotebookDisplay from "@/app/components/EntityDisplayComponents/NotebookDisplay";


const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'drawerWidth' })(
    ({ theme, open, drawerWidth }) => ({
        display: "flex",
        flexGrow: 1,
        // Controls the animations for the drawer opening and closing
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginTop: '30px',
        marginLeft: `-${drawerWidth}px`,
        marginRight: '30px',
        ...(open && {
            marginLeft: 0,
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }),
    }),
);

const DraggableBox = styled(Box)(({ theme }) => ({
    width: '8px',
    backgroundColor: 'grey.300',
    cursor: 'col-resize',
    marginRight: "10px",
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
    },
}));


export default function Library({ params }) {

    const [library, setLibrary] = useState({});

    const [drawerWidth, setDrawerWidth] = useState(410);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const isDraggingRef = useRef(false);

    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState("");

    const handleDrawerOpen = () => {
        setDrawerOpen(true);
    }

    const handleDrawerClose = () => {
        setDrawerOpen(false);
    }

    const handleMouseDown = (e) => {
        isDraggingRef.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    const handleMouseMove = (e) => {
        if (isDraggingRef.current) {
            const newWidth = e.clientX;
            // the 80 is the width of the toolbar and the 12px margin, this needs to change if any of that changes.
            setDrawerWidth(newWidth - 80);
        }
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };


    useEffect(() => {
        getEntity(params.id).then((data) => {
            if (data) {
                setLibrary(JSON.parse(data));
            } else {
                setLibrary(null)
                setErrorSnackbarOpen(true);
                setErrorSnackbarMessage("Error getting library");

            }
        });
    }, [params.id]);

    return (
        <Box sx={{
            display: 'flex',
            marginLeft: '12px',
            marginTop: '12px',
            height: "100%",
        }}>
            {library === null ? (
                <Typography variant="h1">Error loading library. Please try again.</Typography>
            ) : Object.keys(library).length === 0 ? (
                <Typography variant="h6">Loading...</Typography>
            ) : (
                <Box sx={{height: "100%", flexGrow: 1, display: "flex", flexDirection: "column", marginLeft: "35px"}}>
                    <Stack direction="row" alignItems="center">
                        <Typography variant="h6">{library.name}</Typography>
                        <IconButton sx={{ fontSize: '1rem', color: 'black' }}>
                            <Settings fontSize="inherit" />
                        </IconButton>
                        <Button onClick={() => { setDrawerOpen(!drawerOpen) }}>Open Drawer</Button>
                    </Stack>

                    <Main open={drawerOpen} drawerWidth={drawerWidth}>
                        <Stack direction="row" sx={{ width: "100%" }}>
                            <ExplorerDrawer libraryId={params.id} open={drawerOpen} onClose={() => { setDrawerOpen(false) }} drawerWidth={drawerWidth}/>
                            {drawerOpen && <DraggableBox onMouseDown={handleMouseDown} />}
                            <Stack spacing={5} flexGrow={1} justifyContent="flex-start" sx={{ marginLeft: '12px', width: "100%", flexGrow: 1, minWidth: 0, overflow: "hidden" }}>
                                {library.children && library.children.map(child => (
                                    <NotebookDisplay key={child + "-NotebookDisplay"} notebookId={child} libraryName={library.name} libraryId={library.ID} />
                                ))}
                            </Stack>
                        </Stack>
                    </Main>

                </Box>
            )}
            <ErrorSnackbar
                open={errorSnackbarOpen}
                message={errorSnackbarMessage}
                onClose={() => setErrorSnackbarOpen(false)}
            />
        </Box>
    )
}








