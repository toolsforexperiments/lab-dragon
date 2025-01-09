import {useEffect, useRef, useState, useContext} from "react";

import {Box, TextField, Typography} from "@mui/material";
import { styled } from "@mui/material/styles";
import {ClickAwayListener} from "@mui/base/ClickAwayListener";


import {addImageBlock, editImageBlock} from "@/app/calls";
import {UserContext} from "@/app/contexts/userContext";

const UploadBox = styled(Box, { shouldForwardProp: (prop) => prop !== 'isDraggingFile' && prop !== 'isFocused' })(({ theme, isDraggingFile, isFocused }) => ({
        border: `2px dashed ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(2),
        textAlign: 'center',
        cursor: isDraggingFile ? 'copy' : 'pointer',
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: isDraggingFile 
          ? theme.palette.primary.darker 
          : isFocused 
            ? theme.palette.primary.main 
            : theme.palette.divider,
        transition: 'all 0.2s ease',
        backgroundColor: isDraggingFile ? theme.palette.action.hover : 'transparent',
        '&:focus': {
          outline: 'none',
        },
}));

const NewImageHeaderTextField = styled(TextField)(({ theme }) => ({

}));

export default function ImageUploader({ parentId, reloadParent, handleOnClose, contentBlock, underChild }) {

    // When contentBlock is null, it means it is creating a new contentBlock instead of editing one.

    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [isUploadBoxFocused, setIsUploadBoxFocused] = useState(!contentBlock);
    const [titleState, setTitleState] = useState(contentBlock ? contentBlock.content[contentBlock.content.length - 1][1] : "");
    

    const dragCounter = useRef(0);
    const uploadBoxRef = useRef(null);
    const textFieldRef = useRef(null);

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
            if (contentBlock != null) {
                editImageBlock(parentId, contentBlock.ID, activeUsersEmailStr, file, titleState).then((res) => {
                    if (res === true) {
                        reloadParent();
                    } else {
                        console.error("Error updating image");
                    }
                });
            } else {
                addImageBlock(parentId, activeUsersEmailStr, file, underChild).then((res) => {
                    if (res === true) {
                        reloadParent();
                    } else {
                        console.error("Error uploading image");
                    }
                });
            }
            handleOnClose();
        }
    };

    const handleUploadBoxBlur = () => {
        if (contentBlock) {
            setIsUploadBoxFocused(false);
        }
    };

    const handleUploadBoxClick = (e) => {
        if (isUploadBoxFocused === true) {
            document.getElementById('imageInput').click();
        } else {
            setIsUploadBoxFocused(true);
        }
        e.stopPropagation();
    };

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

    // The only time I need to update the image block from here is when only the title changes, if the image changes, it will be handled by the other functions
    const handleClickAway = () => {
        if (contentBlock && titleState !== contentBlock.content[contentBlock.content.length - 1][1]) {
            editImageBlock(parentId, contentBlock.ID, activeUsersEmailStr, null, titleState).then((res) => {
                if (res === true) {
                    reloadParent();
                } else {
                    console.error("Error updating image title");
                }
            });
        }
        handleOnClose();
    }

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

    // Focus the box when component mounts
    useEffect(() => {       
        if (uploadBoxRef.current) {
            uploadBoxRef.current.focus();
        }
    }, [uploadBoxRef]);


    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <Box>
                {contentBlock && <NewImageHeaderTextField
                    inputRef={textFieldRef}
                    autoFocus
                    autoComplete="off"
                    fullWidth
                    label={"Change Image Title"}
                    value={titleState}
                    onChange={(e) => setTitleState(e.target.value)}
                />
                }
                {/* All the extra on handle stuff is to stop the file explorer from opening when the image header text field is focused */}
                <UploadBox
                    ref={uploadBoxRef}
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={handleUploadBoxClick}
                    onBlur={handleUploadBoxBlur}
                    onPaste={handlePaste}
                    tabIndex={0}
                    isDraggingFile={isDraggingFile}
                    isFocused={isUploadBoxFocused}
                >
                    <input
                        id="imageInput"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                    {contentBlock ? (
                        <Box display="flex" flexDirection="row" alignItems="center">
                            <Box component="img"
                                sx={{
                                    height: 'auto',
                                    maxHeight: 500,
                                    objectFit: 'contain'
                            }}
                                // the `?t=${Date.now()}` is to stop nextjs from caching the image to allow for real time updates
                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${parentId}/${contentBlock.ID}?t=${Date.now()}`}
                            />
                            <Typography>
                                To replace this image, drop a new image here, paste from clipboard, or click to select
                            </Typography>
                        </Box>
                    ) : (
                        <Typography>
                            Drop an image here, paste from clipboard, or click to select
                        </Typography>
                    )}
                </UploadBox>
            </Box>
        </ClickAwayListener>
    );
}