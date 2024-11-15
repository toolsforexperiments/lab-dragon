import { useState, useEffect, useContext, useRef } from "react";
import { styled } from '@mui/material/styles';
import { Typography, Paper, IconButton, InputAdornment, Input, Box } from "@mui/material";
import TaskViewer from "@/app/components/TaskViewerComponents/TaskViewer";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";

import { deleteEntity, getEntity } from "@/app/utils";
import NewEntityDialog from "@/app/components/dialogs/NewEntityDialog";
import DeleteEntityDialog from "@/app/components/dialogs/DeleteEntityDialog";
import EditEntityDialog from "@/app/components/dialogs/EditEntityDialog";
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

    // Ref to track the current project section
    const projectRef = useRef(null);
    entitySectionIdRef.current[project.ID] = projectRef;

    const handleOpenNewEntityDialog = () => setNewEntityDialogOpen(true);
    const handleCloseNewEntityDialog = () => setNewEntityDialogOpen(false);
    const handleOpenDeleteDialog = () => setDeleteDialogOpen(true);
    const handleCloseDeleteDialog = () => setDeleteDialogOpen(false);
    const handleOpenEditProjectDialog = () => setEditProjectDialogOpen(true);
    const handleCloseEditProjectDialog = () => setEditProjectDialogOpen(false);

    // Reloads project data from the server
    const reloadProject = async () => {
        try {
            const newProjectData = await getEntity(project.ID);
            setProject(JSON.parse(newProjectData));
        } catch (error) {
            console.error("Error reloading project:", error);
        }
    };

    // Handles the deletion of the current project
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

    // Fetch and update top-level tasks on project changes
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

            <EditEntityDialog
                user="marcos"
                type="Project"
                entityName={project.name}
                entityID={project.ID}
                parentID={project.parent}
                parentName={notebookName}
                open={editProjectDialogOpen}
                onClose={handleCloseEditProjectDialog}
                reloadParent={reloadProject}
            />

            <DeleteEntityDialog
                entityName="Project"
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                onDelete={handleDeleteProject}
            />
        </Box>
    );
}