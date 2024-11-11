"use client";
import { useState, useEffect, useRef, useContext } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Paper, Stack, Breadcrumbs, Box, Divider, IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Input } from "@mui/material";
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Tiptap from "@/app/components/TiptapEditor/Tiptap";
import StepViewer from "../StepViewerComponents/StepViewer";
import TaskContentViewer from "./TaskContentViewer";
import { deleteEntity, getEntity, sortAndFilterChildren, submitNewContentBlock, updateEntity } from "@/app/utils";
import NewEntityDialog from "@/app/components/dialogs/NewEntityDialog";
import { ExplorerContext } from "@/app/contexts/explorerContext";

const StyledTaskPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: "#FFFFFF",
    width: '96%',
    height: '96%',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
}));

const StyledTaskTitleTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: theme.typography.h4.fontSize,
}));

const StyledButtonStack = styled(Stack)(({ theme }) => ({
    position: 'absolute',
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
    position: 'relative',
    color: theme.palette.error.main,
}));

const StyledEditButton = styled(IconButton)(({ theme }) => ({
    position: 'relative',
    color: theme.palette.primary.main,
}));

export default function TaskViewer({ taskEntity, breadcrumbsText, reloadProject }) {

    const { entitySectionIdRef } = useContext(ExplorerContext);

    const [task, setTask] = useState(taskEntity);
    const [steps, setSteps] = useState([]);
    const [activeSteps, setActiveSteps] = useState({});
    const [sortedStepsAndContent, setSortedStepsAndContent] = useState([]);
    const [reloadEditor, setReloadEditor] = useState(0);
    const [newEntityDialogOpen, setNewEntityDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
    const [tempTaskName, setTempTaskName] = useState('');

    const taskRef = useRef(null);
    const newContentBlockRef = useRef(null);

    entitySectionIdRef.current[task.ID] = taskRef;

    const handleOpenNewEntityDialog = () => setNewEntityDialogOpen(true);
    const handleCloseNewEntityDialog = () => setNewEntityDialogOpen(false);
    const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
    const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);
    
    const handleOpenEditTaskDialog = () => {
        setTempTaskName(task.name); // Initialize temp state with current name
        setEditTaskDialogOpen(true);
    };

    const handleCloseEditTaskDialog = () => {
        setTempTaskName(''); // Reset temp state
        setEditTaskDialogOpen(false);
    };

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
        getEntity(task.ID).then(t => {
            setTask(JSON.parse(t));
        });
    };

    const handleDeleteTask = async () => {
        try {
            const success = await deleteEntity(task.ID);
            handleCloseDeleteDialog();
            if (success) {
                reloadProject();
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleUpdateTaskName = async () => {
        try {
            const updateData = { new_name: tempTaskName };

            const success = await updateEntity(task.ID, updateData, "Smuag");
            if (success) {
                setTask(prevTask => ({
                    ...prevTask,
                    name: tempTaskName
                }));
                handleCloseEditTaskDialog();
                reloadTask();
            }
        } catch (error) {
            console.error("Error updating task name:", error);
            alert("Failed to update task name. Please try again.");
        }
    };



    useEffect(() => {
        Promise.all(task.children.map(child => getEntity(child))).then(steps => {
            const newSteps = steps.map(s => JSON.parse(s));
            setSteps(newSteps);
            newSteps.forEach(step => {
                updateStepActiveStatus(step.ID, false);
            });
        });
    }, [task]);

    useEffect(() => {
        const parsedComments = task.comments.map(comment => (typeof comment === 'string' ? JSON.parse(comment) : comment));
        const parsedCommentsTask = { ...task, comments: parsedComments };
        if (parsedCommentsTask.comments && steps) {
            const sortedAndFiltered = sortAndFilterChildren(parsedCommentsTask, steps, false);
            setSortedStepsAndContent(sortedAndFiltered);
        }
    }, [task, steps]);

    return (
        <Box ref={taskRef} sx={{ display: 'flex', justifyContent: 'center' }}>
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
                <Stack flexGrow={1} spacing={2} direction="column">
                    <Breadcrumbs separator=">" color="#4C9DFC" paddingLeft={2} paddingTop={1}>
                        {breadcrumbsText.map(text => (
                            <Typography key={text} color="#000000">{text}</Typography>
                        ))}
                    </Breadcrumbs>
                    <Stack flexGrow={1} spacing={2} direction="column" paddingLeft={2}>
                        {sortedStepsAndContent.map(item => (
                            <Box key={item.ID} display="flex" alignItems="center" width="100%" flexGrow={1}>
                                {item.type ? (
                                    <StepViewer style={{ flexGrow: 1 }} stepEntity={item} markStepState={updateStepActiveStatus} reloadTask={reloadTask} />
                                ) : (
                                    <Box marginLeft={2} flexGrow={1}>
                                        <TaskContentViewer contentBlock={item} entID={task.ID} reloadTask={reloadTask} />
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Stack>
                    <form noValidate autoComplete="off" onSubmit={handleSubmitNewContent}>
                        <StyledNewContentBox marginBottom={1}>
                            <Box marginRight={2}>
                                <ViewCompactIcon />
                            </Box>
                            <Tiptap onContentChange={handleNewContentBlockChange} entID={task.ID} initialContent={newContentBlockRef.current} reloadEditor={reloadEditor} placeholder={`Add content block to "${task.name}" here...`} newLineEditor={true} />
                            <Button type="submit" variant="contained" size="small" sx={{ marginLeft: 1, marginRight: 1 }}>Submit</Button>
                        </StyledNewContentBox>
                    </form>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Divider sx={{ width: "90%", margin: "auto" }} />
                        <IconButton aria-label="add new entity" sx={{ paddingTop: 1 }} onClick={handleOpenNewEntityDialog}>
                            <AddBoxOutlinedIcon titleAccess="Add new entity" />
                        </IconButton>
                    </Box>
                </Stack>
            </StyledTaskPaper>
            <NewEntityDialog user="marcos" type="Step" parentName={task.name} parentID={task.ID} open={newEntityDialogOpen} onClose={handleCloseNewEntityDialog} reloadParent={reloadTask} />
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">{"Confirm Task Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this task? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDeleteTask} color="error" autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={editTaskDialogOpen} onClose={handleCloseEditTaskDialog} aria-labelledby="edit-task-dialog-title" aria-describedby="edit-task-dialog-description">
                <DialogTitle id="edit-task-dialog-title">Edit Task Name</DialogTitle>
                <DialogContent>
                    <DialogContentText id="edit-task-dialog-description">
                        Enter the new name for the task:
                    </DialogContentText>
                    <Input
                        autoFocus
                        margin="dense"
                        fullWidth
                        variant="standard"
                        value={tempTaskName}
                        onChange={(e) => setTempTaskName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditTaskDialog}>Cancel</Button>
                    <Button onClick={handleUpdateTaskName} color="primary" autoFocus>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
