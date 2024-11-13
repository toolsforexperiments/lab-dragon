import { useState, useEffect, useContext, useRef } from "react";
import { styled } from '@mui/material/styles';
import {
    Typography,
    Paper,
    IconButton,
    InputAdornment,
    Input,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";
import TaskViewer from "@/app/components/TaskViewerComponents/TaskViewer";
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { deleteEntity, getEntity, updateEntity } from "@/app/utils";
import NewEntityDialog from "@/app/components/dialogs/NewEntityDialog";
import EditEntityDialog from "@/app/components/dialogs/NewEntityDialog";
import DeleteEntityDialog from "@/app/components/dialogs/DeleteEntityDialog";
import { ExplorerContext } from "@/app/contexts/explorerContext";

const StyledDeleteButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.error.main,
}));

const StyledEditButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const StyledProjectPaper = styled(Paper)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: "#CEE5FF",
    padding: theme.spacing(2),
    width: '100%',
    color: '#005BC7',
}));

const StyledProjectName = styled(Typography)(({ theme }) => ({
    margin: theme.spacing(2, 0),
    color: '#005BC7',
    fontWeight: "bold",
    fontSize: theme.typography.h5.fontSize,
}));

export default function ProjectViewer({ projectEntity, notebookName, reloadNotebook }) {
    const { entitySectionIdRef } = useContext(ExplorerContext);
    const [project, setProject] = useState(projectEntity);
    const [topLevelTasks, setTopLevelTasks] = useState([]);
    const [newEntityDialogOpen, setNewEntityDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
    const [tempProjectName, setTempProjectName] = useState('');

    const projectRef = useRef(null);
    entitySectionIdRef.current[project.ID] = projectRef;

    const handleOpenNewEntityDialog = () => setNewEntityDialogOpen(true);
    const handleCloseNewEntityDialog = () => setNewEntityDialogOpen(false);
    const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
    const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);

    const handleOpenEditProjectDialog = () => {
        setTempProjectName(project.name);
        setEditProjectDialogOpen(true);
    };

    const handleCloseEditProjectDialog = () => {
        setEditProjectDialogOpen(false);
        setTempProjectName('');
    };

    const reloadProject = async () => {
        try {
            const newProjectData = await getEntity(project.ID);
            setProject(JSON.parse(newProjectData));
        } catch (error) {
            console.error("Error reloading project:", error);
        }
    };

    const handleDeleteProject = async () => {
        try {
            const success = await deleteEntity(project.ID);
            if (success) {
                reloadNotebook();
            }
        } catch (error) {
            console.error("Error deleting project:", error);
        } finally {
            handleCloseDeleteDialog();
        }
    };

    const handleUpdateProjectName = async () => {
        try {
            const updates = { new_name: tempProjectName };
            const success = await updateEntity(project.ID, updates, "Smuag", false, false);
            if (success) {
                setProject(prev => ({ ...prev, name: tempProjectName }));
                await reloadProject();
            }
        } catch (error) {
            console.error("Error updating project name:", error);
            alert(`Failed to update project name: ${error.message}`);
        } finally {
            handleCloseEditProjectDialog();
        }
    };

    const handleSaveOnEnter = (e) => {
        if (e.key === 'Enter') {
            handleUpdateProjectName();
        }
    };

    useEffect(() => {
        Promise.all(project.children.map(child => getEntity(child))).then(tasks => {
            const newTasks = tasks.map(task => JSON.parse(task));
            setTopLevelTasks(newTasks);
        });
    }, [project]);

    return (
        <Box ref={projectRef}>
            <StyledProjectPaper>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <StyledProjectName>{project.name}</StyledProjectName>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Input
                            placeholder="Search"
                            size="small"
                            endAdornment={
                                <InputAdornment>
                                    <IconButton>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                        <StyledEditButton onClick={handleOpenEditProjectDialog}>
                            <EditIcon />
                        </StyledEditButton>
                        <StyledDeleteButton onClick={handleOpenDeleteDialog}>
                            <DeleteIcon />
                        </StyledDeleteButton>
                    </Box>
                </Box>
                <Box>
                    {topLevelTasks.map(task => (
                        <Box key={task.ID} ref={entitySectionIdRef.current[task.ID]}>
                            <TaskViewer
                                taskEntity={task}
                                breadcrumbsText={[notebookName, project.name, task.name]}
                                reloadProject={reloadProject}
                            />
                        </Box>
                    ))}
                </Box>
                <Box display="flex" justifyContent="center" mt={2}>
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
            <DeleteEntityDialog
                entityName="Project" // Pass the entity type or name dynamically
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onDelete={handleDeleteProject}
            />
            <EditEntityDialog
                user="marcos"
                type="Project"
                entityName={project.name}
                entityID={project.ID}
                open={editProjectDialogOpen}
                onClose={handleCloseEditProjectDialog}
                reloadParent={reloadProject}
            />
        </Box>
    );
}
