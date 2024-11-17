"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Paper, Stack, Breadcrumbs, Box, IconButton, Button } from "@mui/material";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import Tiptap from "@/app/components/TiptapEditor/Tiptap";
import StepViewer from "../StepViewerComponents/StepViewer";
import TaskContentViewer from "./TaskContentViewer";
import { deleteEntity, getEntity, sortAndFilterChildren, submitNewContentBlock} from "@/app/utils";
import NewEntityDialog from "@/app/components/dialogs/NewEntityDialog";
import EditEntityDialog from "@/app/components/dialogs/EditEntityDialog";
import DeleteEntityDialog from "@/app/components/dialogs/DeleteEntityDialog";
import { ExplorerContext } from "@/app/contexts/explorerContext";

// Styled components remain the same...
const StyledTaskPaper = styled(Paper)(({ theme }) => ({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    width: "96%",
    height: "96%",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
}));

const StyledTaskTitleTypography = styled(Typography)(({ theme }) => ({
    fontWeight: "bold",
    fontSize: theme.typography.h4.fontSize,
}));

const StyledButtonStack = styled(Stack)(({ theme }) => ({
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
}));

const StyledNewContentBox = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    paddingTop: "10px",
    width: "96%",
    paddingLeft: theme.spacing(2),
    marginLeft: theme.spacing(2),
}));

const StyledDeleteButton = styled(IconButton)(({ theme }) => ({
    position: "relative",
    color: theme.palette.error.main,
}));

const StyledEditButton = styled(IconButton)(({ theme }) => ({
    position: "relative",
    color: theme.palette.primary.main,
}));

export default function TaskViewer({ taskEntity, breadcrumbsText, reloadProject }) {
    const { entitySectionIdRef } = useContext(ExplorerContext);

    const [task, setTask] = useState(taskEntity);
    const [steps, setSteps] = useState([]);
    const [sortedStepsAndContent, setSortedStepsAndContent] = useState([]);
    const [reloadEditor, setReloadEditor] = useState(0);
    const [newEntityDialogOpen, setNewEntityDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const taskRef = useRef(null);
    const newContentBlockRef = useRef(null);

    // Add task reference to the context
    entitySectionIdRef.current[task.ID] = taskRef;

    const handleOpenNewEntityDialog = () => setNewEntityDialogOpen(true);
    const handleCloseNewEntityDialog = () => setNewEntityDialogOpen(false);

    const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
    const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);

    const handleOpenEditDialog = () => setEditDialogOpen(true);
    const handleCloseEditDialog = () => setEditDialogOpen(false);

    const handleNewContentBlockChange = (content) => {
        newContentBlockRef.current = content;
    };

    const handleSubmitNewContent = async (e) => {
        e.preventDefault();
        const newContent = newContentBlockRef.current;
        if (newContent) {
            const success = await submitNewContentBlock(task.ID, "marcos", newContent);
            if (success) {
                newContentBlockRef.current = null;
                setReloadEditor(reloadEditor + 1);
                reloadTask();
            } else {
                console.error("Error submitting content block edition");
            }
        }
    };

    const updateStepActiveStatus = (stepId, isActive) => {
        setActiveSteps(prevState => ({
            ...prevState,
            [stepId]: isActive,
        }));
    };

    const reloadTask = () => {
        getEntity(task.ID).then((t) => {
            setTask(JSON.parse(t));
        });
    };

    const handleDeleteTask = async () => {
        try {
            const success = await deleteEntity(task.ID);
            if (success) {
                reloadProject();
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
        handleCloseDeleteDialog();
    };

    // Loads the children, Load task steps when the task changes

    useEffect(() => {
        Promise.all(task.children.map((child) => getEntity(child))).then((steps) => {
            const newSteps = steps.map((s) => JSON.parse(s));
            setSteps(newSteps);
        });
    }, [task]);

    // Sorts the children with content blocks
    useEffect(() => {
        // goes through task.comments parsing any strings
        const parsedComments = task.comments.map((comment) =>
            typeof comment === "string" ? JSON.parse(comment) : comment
        );
        // using a new variables instead of state because I cannot guarantee that state updates in time
        const taskWithParsedComments = { ...task, comments: parsedComments };

        if (taskWithParsedComments.comments && steps) {
            const sortedAndFiltered = sortAndFilterChildren(taskWithParsedComments, steps, false);
            setSortedStepsAndContent(sortedAndFiltered);
        }
    }, [task, steps]);

    return (
        <Box ref={taskRef} sx={{ display: "flex", justifyContent: "center" }}>
            <StyledTaskPaper>
                <Stack direction="row" alignItems="center" justifyContent="space-between" paddingX={2}>
                    <StyledTaskTitleTypography>{task.name}</StyledTaskTitleTypography>
                    <StyledButtonStack direction="row" spacing={1}>
                        <StyledEditButton onClick={handleOpenEditDialog} aria-label="edit task">
                            <EditIcon />
                        </StyledEditButton>
                        <StyledDeleteButton onClick={handleOpenDeleteDialog} aria-label="delete task">
                            <DeleteIcon />
                        </StyledDeleteButton>
                    </StyledButtonStack>
                </Stack>
                <Breadcrumbs separator=">" color="#4C9DFC" paddingLeft={2} paddingTop={1}>
                    {breadcrumbsText.map((text) => (
                        <Typography key={text} color="#000000">
                            {text}
                        </Typography>
                    ))}
                </Breadcrumbs>
                <Stack flexGrow={1} spacing={2} paddingLeft={2}>
                    {sortedStepsAndContent.map((item) => (
                        <Box key={item.ID} display="flex" alignItems="center" flexGrow={1}>
                            {item.type ? (
                                <StepViewer stepEntity={item} reloadTask={reloadTask} />
                            ) : (
                                <TaskContentViewer contentBlock={item} reloadTask={reloadTask} />
                            )}
                        </Box>
                    ))}
                </Stack>
                <form noValidate autoComplete="off" onSubmit={handleSubmitNewContent}>
                    <StyledNewContentBox>
                        <ViewCompactIcon />
                        <Tiptap
                            onContentChange={handleNewContentBlockChange}
                            entID={task.ID}
                            initialContent={newContentBlockRef.current}
                            reloadEditor={reloadEditor}
                            placeholder={`Add content block to "${task.name}" here...`}
                            newLineEditor
                        />
                        <Button type="submit" variant="contained" size="small" sx={{ marginLeft: 1 }}>
                            Submit
                        </Button>
                    </StyledNewContentBox>
                </form>
                <Box display="flex" justifyContent="center">
                    <IconButton onClick={handleOpenNewEntityDialog}>
                        <AddBoxOutlinedIcon sx={{ color: "#4C9DFC" }} />
                    </IconButton>
                </Box>
            </StyledTaskPaper>

            {/* Dialogs */}
            <NewEntityDialog
                user="marcos"
                type="Step"
                parentName={task.name}
                parentID={task.ID}
                open={newEntityDialogOpen}
                onClose={handleCloseNewEntityDialog}
                reloadParent={reloadTask}
            />
            
            <DeleteEntityDialog
                entityName={task.name}
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onDelete={handleDeleteTask}
            />
            
            <EditEntityDialog
                user="marcos"
                type="Task"
                entityName={task.name}
                entityID={task.ID}
                parentName={breadcrumbsText[breadcrumbsText.length - 2] || "Project"}
                open={editDialogOpen}
                onClose={handleCloseEditDialog}
                reloadParent={reloadTask}
            />
        </Box>
    );
}