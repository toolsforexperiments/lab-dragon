"use client"



import Lexical from "@/app/components/LexicalEditor/Lexical";
import { v4 as uuidv4 } from "uuid";
import {ClickAwayListener} from "@mui/base/ClickAwayListener";
import {Box} from "@mui/material";
import {useContext, useState} from "react";
import {UserContext} from "@/app/contexts/userContext";
import {deleteContentBlock, submitContentBlockEdition, submitNewContentBlock} from "@/app/calls";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function TextBlockEditor({ parentId, onEditorChange, initialContent, editorState, onClose, reloadParent, contentBlockId, underChild }) {

    // When contentBlockId is null, it means it is creating a new contentBlock instead of editing one.

    const editorId = 'id_' + uuidv4();

    const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState('');

    const {activeUsersEmailStr} = useContext(UserContext);

    const handleOnClose = () => {

        // Check for deleted case
        if (contentBlockId && initialContent !== "" && editorState.trim() === "") {
            // If the content block had text but is empty, this means it should be deleted
            if (editorState.trim() === "") {
                deleteContentBlock(parentId, contentBlockId).then((res) => {
                    if (res === true) {
                        reloadParent();
                        onClose();
                    } else {
                        setOpenErrorSnackbar(true);
                        setErrorSnackbarMessage("Error deleting Text Block, please try again.");
                    }
                });
                return
            }
        }

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
        submitNewContentBlock(parentId, activeUsersEmailStr, editorState, underChild).then((res) => {
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
                <Box onKeyDown={(e) => {
                    if (e.key === "Enter" && e.shiftKey) {
                        e.preventDefault();
                        handleOnClose();
                    }
                }}>
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





