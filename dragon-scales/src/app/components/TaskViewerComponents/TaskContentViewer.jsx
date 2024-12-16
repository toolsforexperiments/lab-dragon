"use client"

import {useState, useRef, useEffect, useContext} from "react";
import {styled} from "@mui/material/styles";
import {Box, Typography} from "@mui/material";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import Tiptap from "@/app/components/TiptapEditor/Tiptap";
import parse from "html-react-parser";


import {submitContentBlockEdition} from "@/app/calls";
import ErrorSnackbar from "@/app/components/ErrorSnackbar";
import {UserContext} from "@/app/contexts/userContext";


const StyledStepContentBlocksTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
    cursor: 'default',
}))

const StyledContentBox = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    width: '96%',
    '&:hover': {
        backgroundColor: '#bec1ca',
        cursor: 'pointer',
    }

}))

export default function TaskContentViewer( { contentBlock, entID, reloadTask } ) {
    const [isActive, setActive] = useState(false)
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Undefined error");

    const contentBlockRef = useRef(null); // used to track active state
    const textRef = useRef(contentBlock.content[contentBlock.content.length - 1]); // used to track editor text

    const { activeUsersEmailStr } = useContext(UserContext);

    const handleContentChange = (content) => {
        textRef.current = content;
    }

    const activateContentBlock = (event) => {
        setActive(true);
    }

    const deactivateContentBlock = () => {
        setActive(false);
        if (textRef.current !== contentBlock.content[contentBlock.content.length - 1]) {
            const success = submitContentBlockEdition(entID,
                activeUsersEmailStr,
                contentBlock,
                textRef.current).then((success) => {
                if (success === true) {
                    reloadTask();
                } else {
                    setErrorMessage("Error submitting content block edition")
                    setErrorSnackbarOpen(true)
                    console.error("Error submitting content block edition")
                }
            })
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contentBlockRef.current && !contentBlockRef.current.contains(event.target)) {
                deactivateContentBlock()
            }
        };

        if (isActive) {
            document.addEventListener("click", handleClickOutside)
        }
        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [isActive])

    if (isActive) {
        return (
            <StyledContentBox ref={contentBlockRef}>
                <Box marginRight={2}>
                    <ViewCompactIcon/>
                </Box>
                <Tiptap onContentChange={handleContentChange}
                        entID={entID}
                        initialContent={textRef.current} />
                <ErrorSnackbar open={errorSnackbarOpen} message={errorMessage} onClose={() => setErrorSnackbarOpen(false)}/>
            </StyledContentBox>
        )
    } else {
        return (

            <StyledContentBox onClick={activateContentBlock} ref={contentBlockRef}>
                <Box marginRight={2} cursor="pointer">
                    <ViewCompactIcon cursor="pointer"/>
                </Box>
                <StyledStepContentBlocksTypography key={contentBlock.ID}>
                    {parse(contentBlock.content[contentBlock.content.length - 1])}
                </StyledStepContentBlocksTypography>
                <ErrorSnackbar open={errorSnackbarOpen} message={errorMessage} onClose={() => setErrorSnackbarOpen(false)}/>
            </StyledContentBox>
        )
    }

}







