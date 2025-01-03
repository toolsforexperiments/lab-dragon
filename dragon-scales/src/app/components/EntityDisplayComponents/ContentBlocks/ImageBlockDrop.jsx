import {useEffect, useRef, useState, useContext} from "react";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import {ClickAwayListener} from "@mui/base/ClickAwayListener";


import {addImageBlock} from "@/app/calls";
import {UserContext} from "@/app/contexts/userContext";

const UploadBox = styled(Box, { shouldForwardProp: (prop) => prop !== 'isDraggingFile' })(({ theme, isDraggingFile }) => ({
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    textAlign: 'center',
    cursor: isDraggingFile ? 'copy' : 'pointer',
    minHeight: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: isDraggingFile ? theme.palette.primary.darker : theme.palette.primary.main,
    transition: 'all 0.2s ease',
    backgroundColor: isDraggingFile ? theme.palette.action.hover : 'transparent',
}));

export default function ImageUploader({ parentId, reloadParent, handleOnClose }) {

    const uploadBoxRef = useRef(null);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const dragCounter = useRef(0);

    const {activeUsersEmailStr} = useContext(UserContext);

    const handlePaste = (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.type.indexOf('image') === 0) {
                const file = item.getAsFile();
                handleFiles([file]);
            }
        }
    };

    const handleFiles = (files) => {
        const file = files[0];
        if (file && file.type.startsWith('image/')) {
            addImageBlock(parentId, activeUsersEmailStr, file).then((res) => {
                if (res === true) {
                    reloadParent();
                } else {
                    console.error("Error uploading image");
                }
            });
            handleOnClose();
        }
    };

    useEffect(() => {
        const handleDrag = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDragEnter = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current++;
            if (e.dataTransfer.types.includes('Files')) {
                setIsDraggingFile(true);
            }
        };

        const handleDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current--;
            if (dragCounter.current === 0) {
                setIsDraggingFile(false);
            }
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current = 0;
            setIsDraggingFile(false);
        };

        window.addEventListener('dragenter', handleDragEnter);
        window.addEventListener('dragleave', handleDragLeave);
        window.addEventListener('dragover', handleDrag);
        window.addEventListener('drop', handleDrop);

        return () => {
            window.removeEventListener('dragenter', handleDragEnter);
            window.removeEventListener('dragleave', handleDragLeave);
            window.removeEventListener('dragover', handleDrag);
            window.removeEventListener('drop', handleDrop);
        };
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(false);
        dragCounter.current = 0;
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFiles(files);
        }
    };


    // Focus the box when component mounts
    useEffect(() => {       
        if (uploadBoxRef.current) {
            uploadBoxRef.current.focus();
        }
    }, [uploadBoxRef]);


    return (
        <ClickAwayListener onClickAway={handleOnClose}>
            <UploadBox
                ref={uploadBoxRef}
                onDrop={handleDrop}             
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onClick={() => document.getElementById('imageInput').click()}
                onPaste={handlePaste}
                tabIndex={0}
                isDraggingFile={isDraggingFile}
            >
                <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleFiles(e.target.files)}
                />
                <Typography>
                    Drop an image here, paste from clipboard, or click to select
                </Typography>
            </UploadBox>
        </ClickAwayListener>
    );
}