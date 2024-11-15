"use client"

import { useEffect, useRef, useState, useContext } from "react";
import { Box, Button, Divider, Paper, Stack, Typography, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import parse from "html-react-parser";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PropTypes from 'prop-types';
import ActiveStepContentBlock from "@/app/components/StepViewerComponents/ActiveStepContentBlock";
import Tiptap from "@/app/components/TiptapEditor/Tiptap";
import { ExplorerContext } from "@/app/contexts/explorerContext";
import DeleteEntityDialog from "@/app/components/dialogs/DeleteEntityDialog";
import EditEntityDialog from "@/app/components/dialogs/EditEntityDialog";
import { getEntity, submitContentBlockEdition, submitNewContentBlock, deleteEntity } from "@/app/utils";

// Styled components
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
}));

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
}));

const StyledStepTitleTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: theme.typography.h6.fontSize,
}));

const StyledStepContentBlocksTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body1.fontSize,
}));

const StyledNewContentBox = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    paddingTop: "10px",
}));

function StepViewer({ 
    stepEntity, 
    markStepState = () => {}, 
    reloadTask = () => {}, 
    parentID = '', 
    parentName = '', 
}) {
    const { entitySectionIdRef } = useContext(ExplorerContext);

    // State management
    const [step, setStep] = useState(stepEntity);
    const [isActive, setIsActive] = useState(false);
    const [parsedContentBlocksEnt, setParsedContentBlocksEnt] = useState([]);
    const [reloadEditor, setReloadEditor] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    
    // Refs
    const contentBlocksRefs = useRef({});
    const activeContentBlockRef = useRef(null);
    const newContentBlockRef = useRef(null);
    const stepViewerRef = useRef(null);
    const stepRef = useRef(null);

    entitySectionIdRef.current[step.ID] = stepRef;

    // Update step when stepEntity changes
    useEffect(() => {
        setStep(stepEntity);
    }, [stepEntity]);

    // Parse content blocks when step changes
    useEffect(() => {
        if (step?.comments) {
            const parsedBlocks = step.comments.map(comment => JSON.parse(comment));
            setParsedContentBlocksEnt(parsedBlocks);
            contentBlocksRefs.current = parsedBlocks.reduce((acc, block) => {
                acc[block.ID] = block.content[block.content.length - 1];
                return acc;
            }, {});
        }
    }, [step]);

    // Update entitySectionIdRef when step ID changes
    useEffect(() => {
        if (step?.ID && entitySectionIdRef?.current) {
            entitySectionIdRef.current[step.ID] = stepRef;
        }
    }, [step?.ID, entitySectionIdRef]);

    // Handle click outside
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
        };
    }, [isActive]);

    const handleNewContentChange = (content) => {
        newContentBlockRef.current = content;
    };

    const updateContentBlocksRefs = (id, text) => {
        contentBlocksRefs.current[id] = text;
    };

    const activateStepViewer = () => {
        setIsActive(true);
        try {
            markStepState(step.ID, true);
        } catch (error) {
            console.error('Error in markStepState:', error);
        }
    };

    const deactivateStepViewer = async () => {
        setIsActive(false);
        try {
            markStepState(step.ID, false);
        } catch (error) {
            console.error('Error in markStepState:', error);
        }

        const contBlock = parsedContentBlocksEnt.find(block => block.ID === activeContentBlockRef.current);
        const newContent = contentBlocksRefs.current[activeContentBlockRef.current];

        if (newContent && contBlock) {
            try {
                const success = await submitContentBlockEdition(
                    step.ID,
                    "marcos",
                    contBlock,
                    newContent
                );
                
                if (success) {
                    activeContentBlockRef.current = null;
                    const entity = await getEntity(step.ID);
                    setStep(JSON.parse(entity));
                }
            } catch (error) {
                console.error("Error updating content block:", error);
            }
        }
    };

    const handleSubmitNewContent = async (e) => {
        e.preventDefault();
        const newContent = newContentBlockRef.current;
        if (newContent) {
            try {
                const success = await submitNewContentBlock(step.ID, "marcos", newContent);
                if (success) {
                    const entity = await getEntity(step.ID);
                    newContentBlockRef.current = null;
                    setReloadEditor(prev => prev + 1);
                    setStep(JSON.parse(entity));
                }
            } catch (error) {
                console.error("Error submitting new content:", error);
            }
        }
    };

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

    const handleOpenEditDialog = (event) => {
        event.stopPropagation();
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
    };

    // Handle successful edit
    const handleEditSuccess = (updatedStep) => {
        setStep(updatedStep);
    };

    return (
        <Box ref={stepRef} flexGrow={1}>
            {isActive ? (
                <Box ref={stepViewerRef} flexGrow={1} display="flex" alignItems="center">
                    <StyledStepPaperActive>
                        <StyledEditButton 
                            onClick={handleOpenEditDialog} 
                            aria-label="edit step"
                        >
                            <EditIcon />
                        </StyledEditButton>
                        <StyledDeleteButton 
                            onClick={handleOpenDeleteDialog} 
                            aria-label="delete step"
                        >
                            <DeleteIcon />
                        </StyledDeleteButton>
                        <StyledStepTitleTypography paddingLeft={5}>
                            {step.name}
                        </StyledStepTitleTypography>
                        {parsedContentBlocksEnt.map(contentBlock => (
                            <ActiveStepContentBlock 
                                key={contentBlock.ID}
                                contentBlock={contentBlock}
                                entID={step.ID}
                                activeContentBlockRef={activeContentBlockRef}
                                updateContent={updateContentBlocksRefs} 
                            />
                        ))}
                        <Divider sx={{ paddingTop: "5px" }} />
                        <form noValidate autoComplete="off" onSubmit={handleSubmitNewContent}>
                            <StyledNewContentBox>
                                <Box marginRight={2}>
                                    <ViewCompactIcon />
                                </Box>
                                <Tiptap 
                                    onContentChange={handleNewContentChange}
                                    entID={step.ID}
                                    initialContent={newContentBlockRef.current}
                                    reloadEditor={reloadEditor}
                                    placeholder="Write a new content block here..."
                                    newLineEditor={true} 
                                />
                                <Button 
                                    type="submit"
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        marginLeft: 1,
                                        marginRight: 1,
                                    }}
                                >
                                    Submit
                                </Button>
                            </StyledNewContentBox>
                        </form>
                    </StyledStepPaperActive>
                </Box>
            ) : (
                <StyledStepPaper onClick={activateStepViewer}>
                    <Box flexGrow={1} display="flex" alignItems="center">
                        <Box marginRight={2}>
                            <ViewCompactIcon />
                        </Box>
                        <Box>
                            <StyledStepTitleTypography>{step.name}</StyledStepTitleTypography>
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

            <DeleteEntityDialog
                entityName={step.name}
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onDelete={handleDeleteStep}
            />

            <EditEntityDialog
                user="marcos"
                type="Step"
                entityName={step.name}
                entityID={step.ID}
                parentID={parentID}
                parentName={parentName}
                open={editDialogOpen}
                onClose={handleCloseEditDialog}
                reloadParent={reloadTask}
                onEditSuccess={handleEditSuccess}
            />
        </Box>
    );
}

StepViewer.propTypes = {
    stepEntity: PropTypes.shape({
        ID: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        comments: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    markStepState: PropTypes.func,
    reloadTask: PropTypes.func,
    parentID: PropTypes.string,
    parentName: PropTypes.string,
};

export default StepViewer;