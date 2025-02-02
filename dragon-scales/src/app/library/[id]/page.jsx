"use client";
import {useEffect, useState, useRef, useContext, use} from "react";

import { Box, IconButton, Stack, Typography, Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

import ErrorSnackbar from "@/app/components/ErrorSnackbar";
import { getEntity } from "@/app/calls";
import ExplorerDrawer from "@/app/components/ExplorerDrawerComponents/ExplorerDrawer";
import NotebookDisplay from "@/app/components/EntityDisplayComponents/NotebookDisplay";
import NewEntityDialog from "@/app/components/dialogs/NewEntityDialog";
import {UserContext} from "@/app/contexts/userContext";
import {EntitiesRefProvider} from "@/app/contexts/entitiesRefContext";


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

    const unwrappedParams = use(params);

    const [library, setLibrary] = useState({"ID": unwrappedParams.id});

    const [drawerWidth, setDrawerWidth] = useState(410);
    const [drawerOpen, setDrawerOpen] = useState(true);

    // This is used to force a re-render of the tree when a new entity is created.
    const [updateTrees, setUpdateTrees] = useState(0);
    const [createNotebookDialogOpen, setCreateNotebookDialogOpen] = useState(false);
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState("");

    const isDraggingRef = useRef(false);

    const { activeUsersEmailStr } = useContext(UserContext);

    const handleCreateNotebookDialogOpen = () => {
        setCreateNotebookDialogOpen(true);
    }

    const handleCreateNotebookDialogClose = () => {
        setCreateNotebookDialogOpen(false);
    }

    // The following 3 handles are what is used to resize the drawer
    const handleMouseDown = (e) => {
        isDraggingRef.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    const handleMouseMove = (e) => {
        if (isDraggingRef.current) {
            const newWidth = e.clientX;
            // the 80 is the width of the toolbar and the 12px margin, this needs to change if any of that changes.
            setDrawerWidth(newWidth - 112);
        }
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const triggerUpdateTrees = () => {
        setUpdateTrees(updateTrees + 1);
    }
    
    const reloadLibrary = () => {
        getEntity(library.ID).then((data) => {
            if (data) {
                setLibrary(JSON.parse(data));
            } else {
                setLibrary(null)
                setErrorSnackbarOpen(true);
                setErrorSnackbarMessage("Error getting library");
            }
        });
    }


    useEffect(() => {
        getEntity(library.ID).then((data) => {
            if (data) {
                setLibrary(JSON.parse(data));
            } else {
                setLibrary(null)
                setErrorSnackbarOpen(true);
                setErrorSnackbarMessage("Error getting library");

            }
        });
    }, [library.ID]);

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
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h6">{library.name}</Typography>

                        <IconButton
                            onClick={handleCreateNotebookDialogOpen}
                            title={"Create A New Notebook"}
                            sx={{ fontSize: '1.5rem', color: 'black' }}>

                            <Add fontSize="inherit" />
                        </IconButton>

                        {/* <IconButton sx={{ fontSize: '1.5rem', color: 'black' }} title={"Placeholder for now"}>
                            <Tune fontSize="inherit" />
                        </IconButton> */}

                        <Button onClick={() => { setDrawerOpen(!drawerOpen) }}>Toggle Drawer</Button>
                    </Stack>

                    <Main open={drawerOpen} drawerWidth={drawerWidth}>
                        <Stack direction="row" sx={{ width: "100%" }}>
                            <EntitiesRefProvider>
                                <ExplorerDrawer library={library} open={drawerOpen} onClose={() => { setDrawerOpen(false) }} drawerWidth={drawerWidth} updateTrees={updateTrees} />
                                {drawerOpen && <DraggableBox onMouseDown={handleMouseDown} />}
                                <Stack spacing={5} flexGrow={1} justifyContent="flex-start" sx={{ marginLeft: '12px', marginBottom: '50px', width: "100%", flexGrow: 1, minWidth: 0, overflow: "hidden" }}>
                                    {library.children && library.children.map(child => (
                                        <NotebookDisplay key={child + "-NotebookDisplay"} notebookId={child} libraryName={library.name} libraryId={library.ID} reloadTrees={triggerUpdateTrees} />
                                    ))}
                                </Stack>
                            </EntitiesRefProvider>
                        </Stack>
                    </Main>
                <NewEntityDialog
                    user={activeUsersEmailStr}
                    type="Notebook"
                    parentName={library.name}
                    parentID={library.ID}
                    open={createNotebookDialogOpen}
                    onClose={handleCreateNotebookDialogClose}
                    reloadParent={reloadLibrary}
                />
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








