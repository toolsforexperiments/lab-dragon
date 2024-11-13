"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { styled } from "@mui/material/styles";
import {
    Typography,
    Paper,
    Stack,
    Breadcrumbs,
    Box,
    Divider,
    IconButton,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Input,
} from "@mui/material";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import Tiptap from "@/app/components/TiptapEditor/Tiptap";
import StepViewer from "../StepViewerComponents/StepViewer";
import TaskContentViewer from "./TaskContentViewer";
import {
    deleteEntity,
    getEntity,
    sortAndFilterChildren,
    submitNewContentBlock,
    updateEntity,
} from "@/app/utils";
import NewEntityDialog from "@/app/components/dialogs/NewEntityDialog";
import EditEntityDialog from "@/app/components/dialogs/NewEntityDialog";
import DeleteEntityDialog from "@/app/components/dialogs/DeleteEntityDialog";
import { ExplorerContext } from "@/app/contexts/explorerContext";

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

    const [task, setTask] = useState(taskEntity); // Task state
    const [steps, setSteps] = useState([]); // Task steps state
    const [sortedStepsAndContent, setSortedStepsAndContent] = useState([]);
    const [reloadEditor, setReloadEditor] = useState(0);
    const [newEntityDialogOpen, setNewEntityDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
    const [tempTaskName, setTempTaskName] = useState("");

    const taskRef = useRef(null);
    const newContentBlockRef = useRef(null);

    // Add task reference to the context
    entitySectionIdRef.current[task.ID] = taskRef;

    const handleOpenNewEntityDialog = () => setNewEntityDialogOpen(true);
    const handleCloseNewEntityDialog = () => setNewEntityDialogOpen(false);

    const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
    const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);

    const handleOpenEditTaskDialog = () => {
        setTempTaskName(task.name); // Initialize dialog with current task name
        setEditTaskDialogOpen(true);
    };

    const handleCloseEditTaskDialog = () => {
        setTempTaskName(""); // Clear dialog state
        setEditTaskDialogOpen(false);
    };

    const handleNewContentBlockChange = (content) => {
        newContentBlockRef.current = content; // Track new content in ref
    };

    const handleSubmitNewContent = async (e) => {
        e.preventDefault();
        const newContent = newContentBlockRef.current;

        if (newContent) {
            const success = await submitNewContentBlock(task.ID, "marcos", newContent);
            if (success) {
                newContentBlockRef.current = null;
                setReloadEditor((prev) => prev + 1); // Force editor reload
                reloadTask();
            } else {
                console.error("Error submitting content block.");
            }
        }
    };

    const reloadTask = () => {
        getEntity(task.ID).then((t) => {
            setTask(JSON.parse(t)); // Reload task data
        });
    };

    const handleDeleteTask = async () => {
        try {
            const success = await deleteEntity(task.ID);
            if (success) reloadProject();
        } catch (error) {
            console.error("Error deleting task:", error);
        } finally {
            handleCloseDeleteDialog();
        }
    };

    const handleUpdateTaskName = async () => {
        try {
            const updates = { new_name: tempTaskName };
            const success = await updateEntity(task.ID, updates, "marcos");

            if (success) {
                setTask((prev) => ({ ...prev, name: tempTaskName })); // Update local task name
                reloadTask();
            }
        } catch (error) {
            console.error("Error updating task name:", error);
        } finally {
            handleCloseEditTaskDialog();
        }
    };

    // Load task steps when the task changes
    useEffect(() => {
        Promise.all(task.children.map((child) => getEntity(child))).then((steps) => {
            const newSteps = steps.map((s) => JSON.parse(s));
            setSteps(newSteps);
        });
    }, [task]);

    // Sort and filter task steps and content blocks
    useEffect(() => {
        const parsedComments = task.comments.map((comment) =>
            typeof comment === "string" ? JSON.parse(comment) : comment
        );
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
                        <StyledEditButton onClick={handleOpenEditTaskDialog} aria-label="edit task">
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
            <NewEntityDialog
                user="marcos"
                type="Step"
                parentName={task.name}
                parentID={task.ID}
                open={newEntityDialogOpen}
                onClose={handleCloseNewEntityDialog}
                reloadParent={reloadTask}
            />
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Task Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this task? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDeleteTask} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <EditEntityDialog
                user="marcos"
                type="Task"
                entityName={task.name}
                entityID={task.ID}
                open={editTaskDialogOpen}
                onClose={handleCloseEditTaskDialog}
                reloadParent={reloadTask}
            />
        </Box>
    );
}
