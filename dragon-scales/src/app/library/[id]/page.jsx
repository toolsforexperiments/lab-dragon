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
        overflow: "visible",
        position: "relative",
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    }),
);

const ContentStack = styled(Stack, )(({ theme, isDragging }) => ({
        position: 'relative',
        zIndex: 0,
        spacing: 5,
        flexGrow: 1,
        justifyContent: "flex-start",
        margin: '0 12px',
        marginBottom: '50px',
        minWidth: 0,
        maxWidth: '100%',
        overflow: "visible",
        transition: isDragging ? 'none' : theme.transitions.create(['margin', 'width', 'flex', 'flex-basis'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
        }),
        '& img': {
            maxWidth: '100%',
            height: 'auto'
        },
        '& > *': {
            maxWidth: '100%',
            overflow: 'hidden'
        }
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
    '&:active': {
        backgroundColor: theme.palette.primary.dark,
    }
}));


export default function Library({ params }) {

    const unwrappedParams = use(params);

    const [library, setLibrary] = useState({"ID": unwrappedParams.id});

    const [drawerWidth, setDrawerWidth] = useState(410);
    const [drawerOpen, setDrawerOpen] = useState(true);

    const [commentsPanelWidth, setCommentsPanelWidth] = useState(410);
    const [commentsPanelOpen, setCommentsPanelOpen] = useState(false);
    
    const [isDragging, setIsDragging] = useState(false);

    // This is used for immediate width updates during dragging
    const drawerWidthRef = useRef(410);
    const commentsPanelWidthRef = useRef(410);

    // This is used to force a re-render of the tree when a new entity is created.
    const [updateTrees, setUpdateTrees] = useState(0);
    const [createNotebookDialogOpen, setCreateNotebookDialogOpen] = useState(false);
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState("");

    const isDraggingDrawerRef = useRef(false);
    const isDraggingCommentsPanelRef = useRef(false);
    const stackRef = useRef(null);
    const containerRef = useRef(null);

    const { activeUsersEmailStr } = useContext(UserContext);

    const handleCreateNotebookDialogOpen = () => {
        setCreateNotebookDialogOpen(true);
    }

    const handleCreateNotebookDialogClose = () => {
        setCreateNotebookDialogOpen(false);
    }

    // The following 3 handles are what is used to resize the drawer
    const handleMouseDownDrawer = (e) => {
        e.preventDefault();
        isDraggingDrawerRef.current = true;
        setIsDragging(true);
        document.addEventListener('mousemove', handleMouseMoveDrawer);
        document.addEventListener('mouseup', handleMouseUpDrawer);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }

    const handleMouseMoveDrawer = (e) => {
        if (isDraggingDrawerRef.current && containerRef.current) {
            // Calculate container bounds
            const containerRect = containerRef.current.getBoundingClientRect();
            const minWidth = 100; // Minimum drawer width
            const maxWidth = containerRect.width * 0.8; // Maximum drawer width (80% of container)
            
            // Calculate new width based on mouse position relative to container
            // Adjust for Toolbar width (68px) and container's left margin (35px + 12px)
            const relativeX = e.clientX - 58; // Subtract the toolbar width
            const newWidth = Math.max(minWidth, Math.min(maxWidth, relativeX - 47)); // 47 = 35px marginLeft + 12px margin
            
            // Update ref for immediate visual feedback
            drawerWidthRef.current = newWidth;
            
            // Apply the width directly to the element for immediate update
            const drawerElement = document.querySelector('.explorer-drawer-container');
            if (drawerElement) {
                drawerElement.style.width = `${newWidth}px`;
            }
        }
    };

    const handleMouseUpDrawer = () => {
        if (isDraggingDrawerRef.current) {
            // Update state with final width for React rendering
            setDrawerWidth(drawerWidthRef.current);
            isDraggingDrawerRef.current = false;
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMoveDrawer);
            document.removeEventListener('mouseup', handleMouseUpDrawer);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    };

    const handleMouseDownCommentsPanel = (e) => {
        e.preventDefault();
        isDraggingCommentsPanelRef.current = true;
        setIsDragging(true);
        document.addEventListener('mousemove', handleMouseMoveCommentsPanel);
        document.addEventListener('mouseup', handleMouseUpCommentsPanel);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }

    const handleMouseMoveCommentsPanel = (e) => {
        if (isDraggingCommentsPanelRef.current && containerRef.current) {
            // Calculate container bounds
            const containerRect = containerRef.current.getBoundingClientRect();
            const minWidth = 100; // Minimum panel width
            const maxWidth = containerRect.width * 0.8; // Maximum panel width
            
            // Calculate new width based on mouse position relative to viewport
            // We need to account for the toolbar (68px) and left margin (35px + 12px)
            const viewportWidth = window.innerWidth;
            const relativeX = e.clientX - 68; // Subtract the toolbar width
            
            // Calculate the width based on the distance from the right side
            const newWidth = Math.max(minWidth, Math.min(maxWidth, viewportWidth - relativeX - 68 - 25));
            
            // Update ref for immediate visual feedback
            commentsPanelWidthRef.current = newWidth;
            
            // Apply the width directly to the element for immediate update
            const panelElement = document.querySelector('.comments-panel-container');
            if (panelElement) {
                panelElement.style.width = `${newWidth}px`;
            }
        }
    }

    const handleMouseUpCommentsPanel = () => {
        if (isDraggingCommentsPanelRef.current) {
            // Update state with final width for React rendering
            setCommentsPanelWidth(commentsPanelWidthRef.current);
            isDraggingCommentsPanelRef.current = false;
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMoveCommentsPanel);
            document.removeEventListener('mouseup', handleMouseUpCommentsPanel);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
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
                <Box 
                    ref={containerRef}
                    sx={{
                        height: "100%", 
                        position: "relative", 
                        flexGrow: 1, 
                        display: "flex", 
                        flexDirection: "column", 
                        marginLeft: "15px", 
                        maxWidth: "100%",
                        overflow: "auto"
                    }}
                >
                    <Stack sx={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "white",
                        zIndex: 300,
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

                        <Button onClick={() => { setDrawerOpen(!drawerOpen) }}>Toggle Drawer</Button>
                        <Button onClick={() => { setCommentsPanelOpen(!commentsPanelOpen) }}>Toggle Comments Panel</Button>
                    </Stack>

                    <Main>
                        <Stack direction="row" sx={{ width: "100%" }}>
                            <EntitiesRefProvider>
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'row',
                                    width: '100%',
                                    position: 'relative'
                                }}>
                                    <Box 
                                        className="explorer-drawer-container"
                                        sx={{
                                            position: 'sticky',
                                            top: 60,
                                            height: 'calc(100vh - 140px)',
                                            alignSelf: 'flex-start',
                                            width: drawerOpen ? `${drawerWidth}px` : '0px',
                                            overflow: 'hidden',
                                            zIndex: 1,
                                            transition: isDragging ? 'none' : (theme) => theme.transitions.create(['width'], {
                                                easing: theme.transitions.easing.sharp,
                                                duration: theme.transitions.duration.leavingScreen,
                                            }),
                                        }}
                                    >
                                        <ExplorerDrawer
                                            library={library}
                                            open={drawerOpen}
                                            onClose={() => { setDrawerOpen(false) }}
                                            drawerWidth={drawerWidth}
                                            updateTrees={updateTrees} />
                                    </Box>
                                    {drawerOpen && <DraggableBox onMouseDown={handleMouseDownDrawer} />}
                                    
                                    <ContentStack 
                                        ref={stackRef}
                                        isDragging={isDragging}
                                        sx={{ 
                                            flexGrow: 1,
                                            flexBasis: commentsPanelOpen ? 0 : 'auto',
                                            width: '100%',
                                            transition: isDragging ? 'none' : (theme) => theme.transitions.create(
                                                ['flex', 'flex-basis', 'width'], 
                                                {
                                                    easing: theme.transitions.easing.easeInOut,
                                                    duration: theme.transitions.duration.standard,
                                                }
                                            )
                                        }}>
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
                                    <Box 
                                        className="comments-panel-container"
                                        sx={{ 
                                            width: commentsPanelOpen ? `${commentsPanelWidth}px` : '0px',
                                            overflow: 'hidden',
                                            minWidth: commentsPanelOpen ? '300px' : '0px',
                                            position: 'relative',
                                            flex: commentsPanelOpen ? 'none' : '0 0 0px',
                                            transition: isDragging ? 'none' : (theme) => theme.transitions.create(
                                                ['width', 'flex', 'min-width'], 
                                                {
                                                    easing: theme.transitions.easing.easeInOut,
                                                    duration: theme.transitions.duration.standard,
                                                }
                                            ),
                                        }}
                                    >
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








