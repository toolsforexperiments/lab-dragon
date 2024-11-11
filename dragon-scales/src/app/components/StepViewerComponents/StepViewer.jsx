"use client"

import { useEffect, useRef, useState, useContext } from "react";
import { Box, Button, Divider, Paper, Stack, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Input } from "@mui/material";
import { styled } from "@mui/material/styles";
import parse from "html-react-parser";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'
import ActiveStepContentBlock from "@/app/components/StepViewerComponents/ActiveStepContentBlock";
import Tiptap from "@/app/components/TiptapEditor/Tiptap";
import { ExplorerContext } from "@/app/contexts/explorerContext";

import { getEntity, submitContentBlockEdition, submitNewContentBlock, deleteEntity, updateEntity } from "@/app/utils";

const StyledStepPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F1F8FF',
    width: '96%',
    height: '90%',
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    '&:hover': {
        backgroundColor: '#D6E4FF',
        cursor: 'pointer',
    },
}))

const StyledEditButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(6),
    color: theme.palette.primary.main,
}));

const StyledDeleteButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    color: theme.palette.error.main,
}));

const StyledStepPaperActive = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#e0e9ff',
    width: '96%',
    height: '90%',
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
}))

const StyledStepTittleTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: theme.typography.h6.fontSize,
}))

const StyledStepContentBlocksTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
}))

const StyledNewContentBox = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    paddingTop: "10px"
}))

export default function StepViewer({ stepEntity, markStepState, reloadTask }) {

    const { entitySectionIdRef } = useContext(ExplorerContext);

    const [step, setStep] = useState(stepEntity);
    const [isActive, setIsActive] = useState(false);
    const [parsedContentBlocksEnt, setParsedContentBlocksEnt] = useState([]);
    const [reloadEditor, setReloadEditor] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editStepDialogOpen, setEditStepDialogOpen] = useState(false);
    const [tempStepName, setTempStepName] = useState(step.name);
    const contentBlocksRefs = useRef({});
    const activeContentBlockRef = useRef(null);
    const newContentBlockRef = useRef(null);
    const stepViewerRef = useRef(null);
    const stepRef = useRef(null);

    entitySectionIdRef.current[step.ID] = stepRef;

    const handleNewContentChange = (content) => {
        newContentBlockRef.current = content;
    }

    const updateContentBlocksRefs = (id, text) => {
        contentBlocksRefs.current[id] = text;
    }

    const activateStepViewer = () => {
        setIsActive(true);
        markStepState(step.ID, true);
    }

    const deactivateStepViewer = () => {
        setIsActive(false);
        markStepState(step.ID, false);

        const contBlock = parsedContentBlocksEnt.find(block => block.ID === activeContentBlockRef.current)
        const newContent = contentBlocksRefs.current[activeContentBlockRef.current]

        if (newContent && contBlock) {
            const success = submitContentBlockEdition(
                step.ID,
                "marcos",
                contBlock,
                newContent,
            ).then(response => {
                if (success) {
                    activeContentBlockRef.current = null;
                    getEntity(step.ID).then(entity => {
                        setStep(JSON.parse(entity));
                    })
                } else {
                    console.log("Error: content block edition failed")
                }
            });
        }
    }

    const handleSubmitNewContent = (e) => {
        e.preventDefault();
        const newContent = newContentBlockRef.current;
        if (newContent) {
            const success = submitNewContentBlock(step.ID, "marcos", newContent).then(response => {
                if (success) {
                    getEntity(step.ID).then(entity => {
                        newContentBlockRef.current = null;
                        setReloadEditor(prev => prev + 1);
                        setStep(JSON.parse(entity));
                    })
                } else {
                    console.log("Error: new content block submission failed")
                }
            });
        }
    }

    const handleOpenDeleteDialog = (event) => {
        event.stopPropagation();
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
    };

    const handleDeleteStep = async () => {
        try {
            const success = await deleteEntity(step.ID);
            handleCloseDeleteDialog();
            if (success) {
                reloadTask();
            }
        } catch (error) {
            console.error("Error deleting step:", error);
        }
    };

    const handleOpenEditStepDialog = () => {
        setTempStepName(step.name); // Load current name into temp state
        setEditStepDialogOpen(true);
    };

    const handleCloseEditStepDialog = () => {
        setEditStepDialogOpen(false);
    };

    const handleUpdateStepName = async () => {
        if (tempStepName !== step.name) {
            try {
                const updates = { new_name: tempStepName };
                const success = await updateEntity(step.ID, updates, "Smuag");
                if (success) {
                    setStep(prev => ({ ...prev, name: tempStepName }));
                    reloadTask(); // Reload to fetch updated data
                }
            } catch (error) {
                console.error("Failed to update step name:", error);
            }
            handleCloseEditStepDialog();
        }
    };



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (stepViewerRef.current && !stepViewerRef.current.contains(event.target)) {
                deactivateStepViewer();
            }
        };

        if (isActive) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        }
    }, [isActive]);

    useEffect(() => {
        const parsedContentBlocksEnt = step.comments.map(comment => JSON.parse(comment));
        setParsedContentBlocksEnt(parsedContentBlocksEnt);
        contentBlocksRefs.current = parsedContentBlocksEnt.reduce((acc, contentBlock) => {
            acc[contentBlock.ID] = contentBlock.content[contentBlock.content.length - 1];
            return acc;
        }, {});
    }, [step]);

    useEffect(() => {
        entitySectionIdRef.current[step.ID] = stepRef;
    }, [step.ID, entitySectionIdRef]);


    return (
        <Box ref={stepRef} flexGrow={1}>
            {isActive ? (
                <Box ref={stepViewerRef} flexGrow={1} display="flex" alignItems="center">
                    <StyledStepPaperActive>
                        <StyledEditButton onClick={handleOpenEditStepDialog} aria-label="edit step">
                            <EditIcon />
                        </StyledEditButton>
                        <StyledDeleteButton onClick={handleOpenDeleteDialog} aria-label="delete step">
                            <DeleteIcon />
                        </StyledDeleteButton>
                        <StyledStepTittleTypography paddingLeft={5}>{step.name}</StyledStepTittleTypography>
                        {parsedContentBlocksEnt.map(contentBlock => (
                            <ActiveStepContentBlock key={contentBlock.ID}
                                contentBlock={contentBlock}
                                entID={step.ID}
                                activeContentBlockRef={activeContentBlockRef}
                                updateContent={updateContentBlocksRefs} />
                        ))}
                        <Divider sx={{ paddingTop: "5px", }} />
                        <form noValidate autoComplete="off" onSubmit={handleSubmitNewContent}>
                            <StyledNewContentBox>
                                <Box marginRight={2}>
                                    <ViewCompactIcon />
                                </Box>

                                <Tiptap onContentChange={handleNewContentChange}
                                    entID={step.ID}
                                    initialContent={newContentBlockRef.current}
                                    reloadEditor={reloadEditor}
                                    placeholder="Write a new content block here..."
                                    newLineEditor={true} />

                                <Button type="submit"
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        marginLeft: 1,
                                        marginRight: 1
                                    }}
                                >
                                    Submit
                                </Button>
                            </StyledNewContentBox>
                        </form>
                    </StyledStepPaperActive>
                </Box>
            ) : (
                <StyledStepPaper onClick={() => activateStepViewer()}>
                    <Box flexGrow={1} display="flex" alignItems="center">
                        <Box marginRight={2}>
                            <ViewCompactIcon />
                        </Box>
                        <Box>
                            <StyledStepTittleTypography>{step.name}</StyledStepTittleTypography>
                            <Stack spacing={1} direction="column" paddingTop={2}>
                                {parsedContentBlocksEnt.map(contentBlock => (
                                    <StyledStepContentBlocksTypography key={contentBlock.ID}>
                                        {parse(contentBlock.content[contentBlock.content.length - 1])}
                                    </StyledStepContentBlocksTypography>
                                ))}
                            </Stack>
                        </Box>
                    </Box>
                </StyledStepPaper>
            )}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Step Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this step?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDeleteStep} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={editStepDialogOpen} onClose={handleCloseEditStepDialog}>
                <DialogTitle>Edit Step Name</DialogTitle>
                <DialogContent>
                    <DialogContentText>Enter the new name for the step:</DialogContentText>
                    <Input fullWidth value={tempStepName} onChange={(e) => setTempStepName(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditStepDialog}>Cancel</Button>
                    <Button onClick={handleUpdateStepName} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
