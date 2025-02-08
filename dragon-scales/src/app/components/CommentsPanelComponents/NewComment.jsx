"use client"

import {useState, useContext} from "react";
import {Paper, Stack, TextField, Typography, Button, Snackbar, Alert} from "@mui/material";
import {styled} from "@mui/material/styles";


import {UserContext} from "@/app/contexts/userContext";
import LDAvatar from "@/app/components/AvatarStyled";
import {addComment} from "@/app/calls";
import {EntitiesRefContext} from "@/app/contexts/entitiesRefContext";


const StyledNewComment = styled(Paper, { shouldForwardProp: (prop) => prop !== 'topHeight' })(({ theme, topHeight }) => ({
    position: "absolute",
    top: topHeight,
    right: 0,
    left: 0,
    zIndex: 1000,
    padding: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    boxShadow: theme.shadows[4],
}));


const NewCommentTextField = styled(TextField)(({ theme }) => ({
    width: "100%",
    borderRadius: "100px",
    marginTop: theme.spacing(1.3),

}));



export default function NewComment({entityId, onClose}) {

    const [comment, setComment] = useState("");

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    const { activeUsers, activeUsersEmailStr } = useContext(UserContext);
    const { entitiesRef } = useContext(EntitiesRefContext);

    // FIXME: This probably doesn't have to be a state variable.
    const [entityRef, setEntityRef] = useState(entitiesRef.current[entityId].ref.current);
    const reloadEntity = entitiesRef.current[entityId].reload;


    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addComment(entityId, activeUsersEmailStr, comment)
            .then((ret) => {
                if (ret === true) {
                    setComment("");
                    reloadEntity();
                    onClose();
                } else {
                    setSnackbarMessage("Error adding comment");
                    setSnackbarSeverity("error");
                    setIsSnackbarOpen(true);
                }
            })
            .catch((error) => {
                setSnackbarMessage("Error adding comment");
                setSnackbarSeverity("error");
                setIsSnackbarOpen(true);
            });
    };

    return (
        <StyledNewComment topHeight={entityRef.offsetTop}>
            <Stack direction="row" spacing={0.3} alignItems="center">
                {Object.entries(activeUsers).map(([key, value]) => (
                    <LDAvatar 
                        key={key + "-newCommentAvatarIcon"} 
                        bgColor={value.profile_color} 
                        name={value.name} 
                        alt={value.name} 
                    />
                ))}
                {Object.entries(activeUsers).map(([key, value], index, array) => (
                    <Typography 
                        key={key + "-newCommentAvatarName"}
                        variant="body1" 
                        sx={{ fontWeight: "bold"}}>
                        {value.name}{index === array.length - 1 ? '' : ', '}
                    </Typography>
                ))}
            </Stack>
            <form onSubmit={handleSubmit}>
                <NewCommentTextField
                    label="New comment"
                    variant="outlined"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    fullWidth
                    multiline
                    autoFocus
                />
                <Stack direction="row" spacing={0.3} alignItems="center" justifyContent="flex-end" paddingTop={1}>
                    <Button type="button" color="error" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={comment === ""}>Submit</Button>
                </Stack>
            </form>

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
        </StyledNewComment>
    )
}



