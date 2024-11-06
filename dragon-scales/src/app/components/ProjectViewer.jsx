import { useState, useEffect, useContext, useRef } from "react";
import { styled } from '@mui/material/styles';
import {
    Typography,
    Paper,
    Stack,
    IconButton,
    InputAdornment,
    Input,
    Box,
    DialogTitle,
    DialogContent, DialogContentText, DialogActions, Button, Dialog
} from "@mui/material";
import TaskViewer from "@/app/components/TaskViewerComponents/TaskViewer";
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { deleteEntity, getEntity, updateEntity } from "@/app/utils";
import NewEntityDialog from "@/app/components/dialogs/NewEntityDialog";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import EditIcon from "@mui/icons-material/Edit";
import { ExplorerContext } from "@/app/contexts/explorerContext";
import DeleteIcon from "@mui/icons-material/Delete";

const StyledDeleteButton = styled(IconButton)(({ theme }) => ({
    position: 'relative',
    color: theme.palette.error.main,
}));

const StyledEditButton = styled(IconButton)(({ theme }) => ({
    position: 'relative',
    color: theme.palette.primary.main,
}));

const StyledProjectPaper = styled(Paper)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: "#CEE5FF",
    padding: theme.spacing(1),
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
    color: '#005BC7'
}));

const StyledProjectName = styled(Typography)(({ theme }) => ({
    margin: theme.spacing(2),
    color: '#005BC7',
}));

export default function ProjectViewer({ projectEntity, notebookName, reloadNotebook }) {
    const { entitySectionIdRef } = useContext(ExplorerContext);
    const [project, setProject] = useState(projectEntity);
    const [topLevelTasks, setTopLevelTasks] = useState([]);
    const [newEntityDialogOpen, setNewEntityDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState(project.name);

    const projectRef = useRef(null);
    entitySectionIdRef.current[project.ID] = projectRef;

    const handleOpenNewEntityDialog = () => {
        setNewEntityDialogOpen(true);
    }

    const handleCloseNewEntityDialog = () => {
        setNewEntityDialogOpen(false);
    }

    const reloadProject = () => {
        getEntity(project.ID).then(newProject => {
            setProject(JSON.parse(newProject));
        });
    }

    const handleOpenDeleteDialog = () => {
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
    };

    const handleDeleteProject = async () => {
        try {
            const success = await deleteEntity(project.ID);
            handleCloseDeleteDialog();
            if (success) {
                reloadNotebook();
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleOpenEditProjectDialog = () => {
        setEditProjectDialogOpen(true);
    };

    const handleCloseEditProjectDialog = () => {
        setEditProjectDialogOpen(false);
    };

    const handleUpdateProjectName = async () => {
        try {
            console.log("Updating project name to:", newProjectName); // Debugging
            const success = await updateEntity(project.ID, newProjectName, "Smuag", false);
            if (success) {
                // Confirm successful state update
                console.log("Successfully updated project name to:", newProjectName);
                setProject({ ...project, name: newProjectName });
                handleCloseEditProjectDialog();
            }
        } catch (error) {
            console.error("Error updating project name:", error);
        }
    };


    useEffect(() => {
        console.log("Loading top-level tasks for project:", project); // Debugging
        Promise.all(project.children.map(child => getEntity(child))).then(tasks => {
            const newTopLevelTasks = tasks.map(t => JSON.parse(t));
            setTopLevelTasks(newTopLevelTasks);
        });
    }, [project]);

    return (
        <Box ref={projectRef}>
            <StyledProjectPaper>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <StyledProjectName fontWeight="bold" fontSize="1.5rem">{project.name}</StyledProjectName>

                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton variant="outlined" color="#FFFFFF">
                            <ChevronLeftIcon />
                        </IconButton>
                        <Input
                            variant="filled"
                            size="small"
                            endAdornment={
                                <InputAdornment color="#4C9DFC">
                                    <IconButton>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            } />
                        <StyledEditButton onClick={handleOpenEditProjectDialog} aria-label="edit project">
                            <EditIcon />
                        </StyledEditButton>
                        <StyledDeleteButton onClick={handleOpenDeleteDialog} aria-label="delete project">
                            <DeleteIcon />
                        </StyledDeleteButton>


                    </Stack>
                </Stack>
                <Stack flexGrow={1} spacing={2} direction='column' alignItems="center" width="100%">
                    {topLevelTasks.map(task => (
                        <Box key={task.ID} width="100%" ref={entitySectionIdRef.current[task.ID]}>
                            <TaskViewer taskEntity={task}
                                breadcrumbsText={[notebookName, project.name, task.name]}
                                reloadProject={reloadProject} />
                        </Box>
                    ))}
                </Stack>
                <Box display="flex" flexDirection="column" alignItems="center" paddingTop={2}>
                    <IconButton onClick={handleOpenNewEntityDialog}>
                        <AddBoxOutlinedIcon sx={{ color: "#4C9DFC" }} />
                    </IconButton>
                </Box>
            </StyledProjectPaper>
            <NewEntityDialog
                user="marcos"
                type="Task"
                parentName={project.name}
                parentID={project.ID}
                open={newEntityDialogOpen}
                onClose={handleCloseNewEntityDialog}
                reloadParent={reloadProject}
            />
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Project Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this Project?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDeleteProject} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={editProjectDialogOpen}
                onClose={handleCloseEditProjectDialog}
                aria-labelledby="edit-project-dialog-title"
                aria-describedby="edit-project-dialog-description"
            >
                <DialogTitle id="edit-project-dialog-title">Edit Project Name</DialogTitle>
                <DialogContent>
                    <DialogContentText id="edit-project-dialog-description">
                        Enter the new name for the project:
                    </DialogContentText>
                    <Input
                        autoFocus
                        margin="dense"
                        fullWidth
                        variant="standard"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditProjectDialog}>Cancel</Button>
                    <Button onClick={handleUpdateProjectName} color="primary" autoFocus>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}