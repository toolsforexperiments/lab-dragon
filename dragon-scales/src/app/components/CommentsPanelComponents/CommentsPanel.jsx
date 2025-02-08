"use client"

import { useContext, useEffect, useState } from "react";
import {Alert, Box, Drawer, Snackbar, Typography} from "@mui/material";
import { styled } from "@mui/material/styles";
import { EntitiesRefContext } from "@/app/contexts/entitiesRefContext";
import NewComment from "@/app/components/CommentsPanelComponents/NewComment";
import Comment from "@/app/components/CommentsPanelComponents/Comment";
import {ClickAwayListener} from "@mui/base/ClickAwayListener";



const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'drawerWidth' })(({ theme, drawerWidth }) => ({
    position: "relative",
    anchor: "right",
    height: "100%",
    width: drawerWidth,
    flexShrink: 0,
    backgroundColor: "transparent",
    borderRadius: "16px",
    border: "none",
    right: 0,
    marginRight: "10px",
    overflow: "hidden",

    "& .MuiDrawer-paper": {
        width: drawerWidth,
        boxSizing: "border-box",
        position: "relative",
        backgroundColor: "transparent",
        border: "none",
        borderRadius: "16px",
        overflow: "hidden",
        right: 0,
    },
}));



export default function CommentsPanel({ open, setOpen, onClose, drawerWidth, stackRef }) {

    const [newCommentRef, setNewCommentRef] = useState(null);
    const [newCommentId, setNewCommentId] = useState(null);
    const [comments, setComments] = useState([]);

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    const { entitiesRef, commentsIndex, newCommentRequested, setNewCommentRequested } = useContext(EntitiesRefContext);


    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
    }

    const handleNewCommentClose = () => {
        setNewCommentRef(null);
    }

    const handleOpenSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setIsSnackbarOpen(true);
    }

    useEffect(() => {
        if (newCommentRequested && entitiesRef.current.hasOwnProperty(newCommentRequested)) {
            setOpen(true);
            setNewCommentRequested(null);
            setNewCommentId(newCommentRequested);
            setNewCommentRef(entitiesRef.current[newCommentRequested].ref.current);

        }
    }, [newCommentRequested, setNewCommentRequested]);

    useEffect(() => {
        const newComments = Object.values(commentsIndex)
            .map((comment) => {
                if (entitiesRef.current.hasOwnProperty(comment.target) === false) {
                    handleOpenSnackbar(`Comment with target ${comment.target} not found, please contact the administrator to get this fixed.`, "error");
                    return null;
                } else {
                    return [comment, entitiesRef.current[comment.target].ref];
                }
            })
            .filter(comment => comment !== null);
        setComments(newComments);
    }, [commentsIndex]);

    return (
        <StyledDrawer variant="persistent" anchor="right" open={open} onClose={onClose} drawerWidth={drawerWidth}>
            <Box sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflowY: "clip",
            }}>
                {newCommentRef !== null &&
                    <ClickAwayListener onClickAway={handleNewCommentClose}>
                        <Box>
                            <NewComment
                                    key="NewCommentElement"
                                    entityRef={newCommentRef}
                                    entityId={newCommentId}
                                    onClose={handleNewCommentClose}
                                />
                        </Box>
                    </ClickAwayListener>
                }
                {comments && comments.length > 0 && comments.map((comment) => {
                    return (
                        <Comment key={comment[0].ID} comment={comment[0]} entityRef={comment[1].current} />
                    )
                })}

            </Box>
            <Snackbar
                open={isSnackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </StyledDrawer>
    );
}







