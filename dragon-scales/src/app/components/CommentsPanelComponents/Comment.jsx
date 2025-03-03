"use client"

import {useContext, useEffect, useState} from "react";

import {Box, Button, IconButton, Paper, Stack, TextField, Typography} from "@mui/material";
import {styled, useTheme} from "@mui/material/styles";
import CheckIcon from '@mui/icons-material/Check';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { useResizeDetector } from 'react-resize-detector';

import {UserContext} from "@/app/contexts/userContext";
import LDAvatar from "@/app/components/AvatarStyled";
import {formatDate} from "@/app/utils";
import {ClickAwayListener} from "@mui/base/ClickAwayListener";
import {addCommentReply, resolveComment} from "@/app/calls";
import {EntitiesRefContext} from "@/app/contexts/entitiesRefContext";



const StyledComment = styled(Paper, { shouldForwardProp: (prop) => prop !== 'topHeight' && prop !== 'isActive'  })(({ theme, topHeight, isActive }) => ({
    position: "absolute",
    top: topHeight,
    right: 0,
    left: 0,
    padding: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    boxShadow: theme.shadows[4],
    transition: 'all 0.3s ease-in-out',

    ...(!isActive && {
        "&:hover": {
            boxShadow: theme.shadows[6],
            backgroundColor: theme.palette.primary.light,
            cursor: "pointer",
        },

        boxShadow: theme.shadows[6],
    })

}));


const EditCommentTextField = styled(TextField)(({ theme }) => ({
    width: "100%",
    borderRadius: "100px",
    marginTop: theme.spacing(1.3),

}));

const ReplyCommentTextField = styled(TextField)(({ theme }) => ({
    width: "100%",
    borderRadius: "100px",
    marginTop: theme.spacing(1.3),

}));


const CommentOptionsBox = styled(Box)(({ theme }) => ({
    '& .MuiButtonBase-root': {
        opacity: 0,
        transition: 'opacity 0.3s',
        marginRight: "10px",
    },
    '&:hover .MuiButtonBase-root': {
        opacity: 1,
    }
}));


export default function Comment({comment, topHeight}) {

    const theme = useTheme();

    const [isActive, setIsActive] = useState(false);
    const [newReply, setNewReply] = useState("");

    const { systemUsers, activeUsersEmailStr } = useContext(UserContext);
    const { entitiesRef, setCommentsIndex } = useContext(EntitiesRefContext);

    const reloadEntity = entitiesRef[comment.parent].reload;
    const highlight = entitiesRef[comment.parent].highlight;
    const deHighlight = entitiesRef[comment.parent].deHighlight;

    const { width, height, ref } = useResizeDetector({
        refreshMode: 'debounce',
        refreshRate: 100,
        handleHeight: true,
        observerOptions: {box: 'border-box'},
    });    

    const handleClickAway = () => {
        setIsActive(false);
    }

    const handleAddReply = (e) => {
        e.preventDefault();
        addCommentReply(comment.parent, comment.ID, activeUsersEmailStr, newReply).then((ret) => {
            if (ret === true) {
                setNewReply("");
                setIsActive(false);
                reloadEntity();
            } else {
                console.error("Error adding reply")
            }
        });
    }

    const handleCancelNewReply = (e) => {
        e.stopPropagation();
        setIsActive(false);

    }

    const handleResolveComment = (e) => {
        e.stopPropagation();
        resolveComment(comment.parent, comment.ID).then((ret) => {
            if (ret === true) {
                reloadEntity();
                
            } else {
                console.error("Error resolving comment")
            }
        });
    }

    const renderNamesAndDate = (users, time, topLevel=false) => {
        return (
        <Box>
            <Stack justifyContent="space-between" direction="row" alignItems="center">
                <Stack direction="row" spacing={0.3} alignItems="center">
                    {users.map((userEmail) => {
                        const user = systemUsers[userEmail];
                        if (!user) {
                            return null;
                        }
                        return (
                            <LDAvatar
                                key={userEmail + "userAvatar" + comment.ID}
                                bgColor={user.profile_color}
                                name={user.name}
                                alt={user.name}
                            />
                        );
                    })}
                    <Stack sx={{paddingLeft: "10px"}}>
                        <Box>
                            <Stack direction="row" spacing={0.3}>
                                {users.map((userEmail, index, array) => (
                                    <Typography
                                        key={userEmail + "-newCommentAvatarName"}
                                        variant="body1"
                                        sx={{ fontWeight: "bold"}}>
                                        {systemUsers[userEmail].name}{index < array.length - 1 ? ", " : ""}
                                    </Typography>
                                ))}
                            </Stack>
                            <Typography>
                                {formatDate(time)}
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>
                <Stack direction="row" spacing={0.3}>
                    {(topLevel) && (
                        <IconButton title="Mark as resolved and hide discussion"
                                    onClick={handleResolveComment}
                                    sx={{
                                        color: theme.palette.primary.darker,
                                    }}
                        >
                            <CheckIcon />
                        </IconButton>
                    )}
                    <IconButton title="More options" sx={{color: theme.palette.buttons.iconButton.entityHeader}}>
                        <MoreVertIcon />
                    </IconButton>
                </Stack>
            </Stack>
        </Box>
        )
    }

    // Register the height variable state for this comment.
    useEffect(() => {
        if (height !== null) {
            setCommentsIndex(prev => ({
                ...prev,
                [comment.ID]: {
                    "comment": prev[comment.ID]?.comment || comment,
                    "height": height
                }
            }));
        }
    }, [height, comment.ID, setCommentsIndex]);

    return (
        <ClickAwayListener onClickAway={handleClickAway} disableReactTree={isActive}>
            {/* CommentOptionsBox because this has the css that hides the icon buttons and shows them on hover. This needs to be here because they apply to the comment as a whole */}
            <CommentOptionsBox>
                <StyledComment ref={ref}
                               topHeight={topHeight}
                               isActive={isActive}
                               onClick={() => (setIsActive(true))}
                               onMouseEnter={() => highlight()}
                               onMouseLeave={() => {deHighlight()}}>
                    {renderNamesAndDate(comment.creation_user, comment.creation_time, true)}
                    <Typography>{comment.body}</Typography>
                    {comment.replies.map((reply) => (
                        <Box key={reply.ID}>
                            {renderNamesAndDate(reply.user[reply.user.length - 1], reply.timestamp[reply.timestamp.length - 1])}
                            <Typography>{reply.body}</Typography>
                        </Box>
                    ))}

                    {isActive && (
                        <form onSubmit={handleAddReply}>
                            <ReplyCommentTextField
                                label="New Reply"
                                variant="outlined"
                                value={newReply}
                                onChange={(e) => setNewReply(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddReply(e);
                                    }
                                }}
                                fullWidth
                                multiline
                                autoFocus
                                />
                            <Stack direction="row" spacing={0.3} alignItems="center" justifyContent="flex-end" paddingTop={1}>
                                <Button type="button" color="error" onClick={handleCancelNewReply}>Cancel</Button>
                                <Button type="submit" disabled={comment === ""}>Submit</Button>
                            </Stack>
                        </form>
                    )}
                </StyledComment>
            </CommentOptionsBox>
        </ClickAwayListener>


    )

}

