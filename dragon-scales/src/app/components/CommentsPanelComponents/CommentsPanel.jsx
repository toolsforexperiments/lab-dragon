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


export default function CommentsPanel({ open, setOpen, onClose, drawerWidth }) {

    const [newCommentRef, setNewCommentRef] = useState(null);
    const [newCommentId, setNewCommentId] = useState(null);
    const [comments, setComments] = useState([]);
    // Object holding the id of comments as keys and the calculated offsetTop as values such that comments don't crop over each other.
    const [calculatedOffsets, setCalculatedOffsets] = useState({});

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

    const calculateCommentsHeights = () => {
        const lastPixels = {}; // Storing where each comment last pixel height is located
        const offsets = {};  // Storing the real offset for each comment

        // FIXME: When we fix adding comments to nested things and not just Projects, we need to check how many things are in element [1] and add all of their offsetTops together when comparing
        // FIXME: We should probably take special care when aTop - bTop are 0, this means that they are commenting the same item and the creation time should be check to see which one goes first.
        const sortedComments = [...comments].sort((a, b) => {
            const aTop = a[1].current?.offsetTop || 0;
            const bTop = b[1].current?.offsetTop || 0;
            return aTop - bTop;
        });

        sortedComments.map(([comment, targetRef], index) => {
            if (commentsIndex.hasOwnProperty(comment.ID)) {
                // Catches the case of a comment that has a deleted parent as an entity.
                if (targetRef.current == null) {
                    return;
                }
                const commentOffsetTop = targetRef.current.offsetTop;
                const height = commentsIndex[comment.ID].height;
                let correctedOffset = commentOffsetTop;
                let previousLastPixel;
                if (index > 0) {
                    while (lastPixels[sortedComments[index -1][0].ID] == null) {
                        // If the first comment is deleted, there is no previous comment to compare to, so we need to break the loop
                        if (index <= 1) {
                            break;
                        }
                        index--;
                    }
                    previousLastPixel = lastPixels[sortedComments[index -1][0].ID];
                } else {
                    previousLastPixel = 0;
                }

                if (commentOffsetTop - previousLastPixel <= 0) {
                    correctedOffset = previousLastPixel + 5;
                }
                offsets[comment.ID] = correctedOffset;
                lastPixels[comment.ID] = correctedOffset + height;
        }

        })
        setCalculatedOffsets(offsets)
    }

    useEffect(() => {
        if (newCommentRequested && entitiesRef.hasOwnProperty(newCommentRequested)) {
            setOpen(true);
            setNewCommentRequested(null);
            setNewCommentId(newCommentRequested);
            setNewCommentRef(entitiesRef[newCommentRequested].ref.current);

        }
    }, [newCommentRequested, setNewCommentRequested]);

    useEffect(() => {
        // Filters the comments here. (deletes resolved and comments with targets that don't exist).
        const newComments = Object.values(commentsIndex)
            .map((ind) => {
                const comment = ind["comment"];
                if (entitiesRef.hasOwnProperty(comment.target) === false) {
                    handleOpenSnackbar(`Comment with target ${comment.target} not found, please contact the administrator to get this fixed.`, "error");
                    return null;
                }
                
                if (comment.resolved === true){
                    return null
                }
                if (entitiesRef[comment.parent]["deleted"] === true) {
                    return null;
                }

                return [comment, entitiesRef[comment.target].ref];
                
            })
            .filter(comment => comment !== null);
        if (newComments.length > 0) {
            setOpen(true);
        } else if (newComments.length === 0) {
            setOpen(false);
        }
        setComments(newComments);
        calculateCommentsHeights();
    }, [commentsIndex]);


    useEffect(() => {
        calculateCommentsHeights();
    }, [commentsIndex])

    return (
        <StyledDrawer variant="persistent" anchor="right" open={open} onClose={onClose} drawerWidth={drawerWidth}>
            <Box sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflowY: "auto",
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
                        <Comment key={comment[0].ID}
                                 comment={comment[0]}
                                 topHeight={calculatedOffsets[comment[0].ID]}
                                 recalculateHeight={calculateCommentsHeights}
                        />
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







