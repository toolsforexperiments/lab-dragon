"use client"

import {useCallback, useContext, useEffect, useState} from "react";

import {Box, Button, Paper, Stack, TextField, Typography} from "@mui/material";
import {styled} from "@mui/material/styles";

import { useResizeDetector } from 'react-resize-detector';

import {UserContext} from "@/app/contexts/userContext";
import LDAvatar from "@/app/components/AvatarStyled";
import {formatDate} from "@/app/utils";
import {ClickAwayListener} from "@mui/base/ClickAwayListener";
import {addCommentReply} from "@/app/calls";
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


export default function Comment({comment, topHeight}) {

    const [isActive, setIsActive] = useState(false);
    const [newReply, setNewReply] = useState("");

    const { systemUsers, activeUsersEmailStr } = useContext(UserContext);
    const { entitiesRef, setCommentsIndex } = useContext(EntitiesRefContext);

    const reloadEntity = entitiesRef[comment.parent].reload;

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

    const renderNamesAndDate = (users) => {
        
        return (
        <Box>
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
                            {formatDate(comment.creation_time)}
                        </Typography>
                    </Box>
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
            <Box>
                <StyledComment ref={ref} topHeight={topHeight} isActive={isActive} onClick={() => (setIsActive(true))}>
                    {renderNamesAndDate(comment.creation_user)}
                    <Typography>{comment.body}</Typography>
                    {comment.replies.map((reply) => (
                        <Box key={reply.ID}>
                            {renderNamesAndDate(reply.user[reply.user.length - 1])}
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
            </Box>
        </ClickAwayListener>


    )

}

