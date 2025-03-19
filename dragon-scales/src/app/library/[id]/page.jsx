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
import CommentsPanel from "@/app/components/CommentsPanelComponents/CommentsPanel";


const Main = styled('main')(({ theme}) => ({
        display: "flex",
        flexGrow: 1,
        width: "100%",
        maxWidth: "100%",
        marginTop: '30px',
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    }),
);

const ContentStack = styled(Stack, )(({ theme}) => ({
        position: 'relative',
        zIndex: 1,
        spacing: 5,
        flexGrow: 1,
        justifyContent: "flex-start",
        margin: '0 12px',
        marginBottom: '50px',
        minWidth: 0,
        overflow: "visible",
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        })
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

    const [commentsPanelWidth, setCommentsPanelWidth] = useState(410);
    const [commentsPanelOpen, setCommentsPanelOpen] = useState(false);

    // This is used to force a re-render of the tree when a new entity is created.
    const [updateTrees, setUpdateTrees] = useState(0);
    const [createNotebookDialogOpen, setCreateNotebookDialogOpen] = useState(false);
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState("");

    const isDraggingDrawerRef = useRef(false);
    const isDraggingCommentsPanelRef = useRef(false);
    const stackRef = useRef(null);

    const { activeUsersEmailStr } = useContext(UserContext);

    const handleCreateNotebookDialogOpen = () => {
        setCreateNotebookDialogOpen(true);
    }

    const handleCreateNotebookDialogClose = () => {
        setCreateNotebookDialogOpen(false);
    }

    // The following 3 handles are what is used to resize the drawer
    const handleMouseDownDrawer = (e) => {
        isDraggingDrawerRef.current = true;
        document.addEventListener('mousemove', handleMouseMoveDrawer);
        document.addEventListener('mouseup', handleMouseUpDrawer);
    }

    const handleMouseMoveDrawer = (e) => {
        if (isDraggingDrawerRef.current) {
            const newWidth = e.clientX;
            // the 80 is the width of the toolbar and the 12px margin, this needs to change if any of that changes.
            setDrawerWidth(newWidth - 112);
        }
    };

    const handleMouseUpDrawer = () => {
        isDraggingDrawerRef.current = false;
        document.removeEventListener('mousemove', handleMouseMoveDrawer);
        document.removeEventListener('mouseup', handleMouseUpDrawer);
    };

    const handleMouseDownCommentsPanel = (e) => {
        isDraggingCommentsPanelRef.current = true;
        document.addEventListener('mousemove', handleMouseMoveCommentsPanel);
        document.addEventListener('mouseup', handleMouseUpCommentsPanel);
    }

    const handleMouseMoveCommentsPanel = (e) => {
        if (isDraggingCommentsPanelRef.current) {
            const newWidth = e.clientX;
            setCommentsPanelWidth(window.innerWidth - newWidth - 25);
        }
    }

    const handleMouseUpCommentsPanel = () => {
        isDraggingCommentsPanelRef.current = false;
        document.removeEventListener('mousemove', handleMouseMoveCommentsPanel);
        document.removeEventListener('mouseup', handleMouseUpCommentsPanel);
    }

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
                <Box sx={{height: "100%", position: "sticky", flexGrow: 1, display: "flex", flexDirection: "column", marginLeft: "35px", maxWidth: "100%"}}>
                    <Stack sx={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "white",
                        zIndex: 10,
                        padding: "10px 0",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.12)"
                    }} direction="row" alignItems="center" spacing={2}>
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
                        <Button onClick={() => { setCommentsPanelOpen(!commentsPanelOpen) }}>Toggle Comments Panel</Button>
                    </Stack>

                    <Main>
                        <Stack direction="row" sx={{ width: "100%" }}>
                            <EntitiesRefProvider>
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'row',
                                    width: '100%'
                                }}>
                                    <Box sx={{
                                        position: 'sticky',
                                        top: 60,
                                        height: 'calc(100vh - 140px)',
                                        alignSelf: 'flex-start',
                                        width: drawerOpen ? `${drawerWidth}px` : '0px',
                                        overflow: 'hidden',
                                        transition: (theme) => theme.transitions.create(['width'], {
                                            easing: theme.transitions.easing.sharp,
                                            duration: theme.transitions.duration.leavingScreen,
                                        }),
                                    }}>
                                        <ExplorerDrawer
                                            library={library}
                                            open={drawerOpen}
                                            onClose={() => { setDrawerOpen(false) }}
                                            drawerWidth={drawerWidth}
                                            updateTrees={updateTrees} />
                                    </Box>
                                    {drawerOpen && <DraggableBox onMouseDown={handleMouseDownDrawer} />}
                                    
                                    <ContentStack 
                                        ref={stackRef}>
                                        {library.children && library.children.map(child => (
                                            <NotebookDisplay
                                                key={child + "-NotebookDisplay"}
                                                notebookId={child}
                                                libraryName={library.name}
                                                libraryId={library.ID}
                                                reloadTrees={triggerUpdateTrees} />
                                        ))}
                                    </ContentStack>
                                    
                                    {commentsPanelOpen && <DraggableBox onMouseDown={handleMouseDownCommentsPanel} />}
                                    <Box sx={{ 
                                        width: commentsPanelOpen ? `${commentsPanelWidth}px` : '0px',
                                        overflow: 'hidden',
                                        transition: (theme) => theme.transitions.create(['width'], {
                                            easing: theme.transitions.easing.sharp,
                                            duration: theme.transitions.duration.leavingScreen,
                                        }),
                                    }}>
                                        <CommentsPanel
                                            open={commentsPanelOpen}
                                            setOpen={setCommentsPanelOpen}
                                            drawerWidth={commentsPanelWidth}
                                            onClose={() => setCommentsPanelOpen(false)}
                                            stackRef={stackRef} />
                                    </Box>
                                </Box>
                            </EntitiesRefProvider>
                        </Stack>
                    </Main>

🔥🔥🔥🐉🐉🐉

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








