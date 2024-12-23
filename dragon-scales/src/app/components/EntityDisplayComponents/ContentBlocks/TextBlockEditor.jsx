"use client"



import Lexical from "@/app/components/LexicalEditor/Lexical";
import { v4 as uuidv4 } from "uuid";
import {ClickAwayListener} from "@mui/base/ClickAwayListener";
import {Box} from "@mui/material";
import {useContext, useState} from "react";
import {UserContext} from "@/app/contexts/userContext";
import {submitContentBlockEdition, submitNewContentBlock} from "@/app/calls";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function TextBlockEditor({ parentId, onEditorChange, initialContent, editorState, onClose, reloadParent, contentBlockId }) {

    // When contentBlockId is null, it means it is creating a new contentBlock instead of editing one.

    const editorId = 'id_' + uuidv4();

    const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState('');

    const {activeUsersEmailStr} = useContext(UserContext);

    const handleOnClose = () => {

        // Nothing changes case
        if (!editorState || editorState.trim() === '' || (contentBlockId && editorState === initialContent)) {
            onClose();
            return
        }

        // Editing existing content block case
        if (contentBlockId) {
            submitContentBlockEdition(parentId, activeUsersEmailStr, contentBlockId, editorState).then((res) => {
                if (res === true) {
                    reloadParent();
                    onEditorChange("");
                    onClose();
                } else {
                    setOpenErrorSnackbar(true);
                    setErrorSnackbarMessage("Error editing Text Block, please try again.");
                }
            });
            return
        }

        // New content block case
        submitNewContentBlock(parentId, activeUsersEmailStr, editorState).then((res) => {
            if (res === true) {
                reloadParent();
                onEditorChange("");
                onClose();
            } else {
                setOpenErrorSnackbar(true);
                setErrorSnackbarMessage("Error creating new Text Block, please try again.");
            }
        });

    }

    return (

        <Box>
            <ClickAwayListener onClickAway={handleOnClose}>
                <Box>
                    <Lexical autoFocus onChange={onEditorChange} initialContent={initialContent} editorId={editorId} />
                </Box>
            </ClickAwayListener>
            <Snackbar 
                open={openErrorSnackbar} 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ 
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Alert onClose={() => setOpenErrorSnackbar(false)} severity="error" sx={{ width: 'auto' }}>
                    {errorSnackbarMessage}
                </Alert>
            </Snackbar>

        </Box>
    );


}





