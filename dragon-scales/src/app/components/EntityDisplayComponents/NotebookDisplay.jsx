"use client";

import { useState, useEffect } from "react";
import InsertChartIcon from '@mui/icons-material/InsertChart';
import ShareIcon from '@mui/icons-material/Share';
import {Box, IconButton, Stack, Typography, Button} from "@mui/material";
import { Add, Settings } from "@mui/icons-material";
import { styled } from '@mui/material/styles';

import {getEntity} from "@/app/calls";
import ErrorSnackbar from "@/app/components/ErrorSnackbar";
import EntityBreadcrumbs from "@/app/components/EntityDisplayComponents/EntityBreadcrumbs";
import EntityDisplay from "@/app/components/EntityDisplayComponents/EntityDisplay";


const DashedBox = styled(Box)(({theme}) => ({
    display: 'flex',
    padding: '60px',
    flexGrow: 1,
    minHeight: '100px',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: `2px dashed ${theme.palette.text.secondary}`,
}));

const EmptyNotebookText = styled(Typography)(({theme}) => ({
    color: theme.palette.text.secondary,
}));

const EmptyNotebookButton = styled(Button)(({theme}) => ({
    border: `1px solid ${theme.palette.primary.lighter}`,
    borderRadius: '4px',
    color: theme.palette.primary.dark,

    '& .MuiChip-root': { 
        color: "currentColor",
        borderColor: "currentColor"
    },

    '& .MuiSvgIcon-root': {
        color: theme.palette.primary.dark,
    }
}));



export default function NotebookDisplay({ notebookId, libraryId, libraryName, reloadTrees }) {


    const [notebook, setNotebook] = useState({});


    const [displayCreationEntityDisplay, setDisplayCreationEntityDisplay] = useState(false);
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState("");

    const toggleCreationEntityDisplay = () => {
        setDisplayCreationEntityDisplay(!displayCreationEntityDisplay);
    }

    const reloadNotebook = () => {
        getEntity(notebookId).then((data) => {
            if (data) {
                const parsedData = JSON.parse(data);
                setNotebook(parsedData);
                if (parsedData.children.length > 0) {
                    setDisplayCreationEntityDisplay(false);
                }
            } else {
                setNotebook(null)
                setErrorSnackbarOpen(true);
                setErrorSnackbarMessage("Error getting notebook with id " + notebookId + ". Please reload page and try again");
            }
        });
    }

    useEffect(() => {
        getEntity(notebookId).then((data) => {
            if (data) {
                setNotebook(JSON.parse(data));
            } else {
                setNotebook(null)
                setErrorSnackbarOpen(true);
                setErrorSnackbarMessage("Error getting notebook with id " + notebookId + ". Please reload page and try again");
            }
        });
    }, [notebookId]);

    return (
        <Box>
            {notebook === null ? (
                <Typography variant="h3">Error loading notebook with id {notebookId} please try again</Typography>
            ) : Object.keys(notebook).length === 0 ? (
                <Typography variant="h3">Loading...</Typography>
            ) : (
                <Box>
                    <Stack direction="row" justifyContent="space-between">
                        <EntityBreadcrumbs links={[["/library/" + libraryId, libraryName], ["/library/" + libraryId + "?select=" + notebookId, notebook.name]]} />
                        <Box>
                            <Stack direction="row" >
                                <IconButton>
                                    <InsertChartIcon />
                                </IconButton>

                                <IconButton>
                                    <Settings />
                                </IconButton>

                                <IconButton>
                                    <ShareIcon />
                                </IconButton>
                            </Stack>
                        </Box>
                    </Stack>

                    {notebook.children && notebook.children.length > 0 ? (
                        <Stack spacing={2}>
                            {notebook.children.map(child => (
                                <EntityDisplay key={child + "-EntityDisplay"} entityId={child} reloadParent={reloadNotebook} reloadTrees={reloadTrees} />
                            ))}
                        </Stack>
                    ) : (
                        displayCreationEntityDisplay ? (
                            <EntityDisplay entityId={null}
                            parentId={notebook.ID} 
                            reloadParent={reloadNotebook} 
                            reloadTrees={reloadTrees}
                            entityType="Project" 
                            toggleCreationEntityDisplay={toggleCreationEntityDisplay}
                            setParentErrorSnackbarOpen={setErrorSnackbarOpen}
                            setParentErrorSnackbarMessage={setErrorSnackbarMessage}
                            />
                        ) : (
                            <DashedBox>
                                <Stack alignItems="center" justifyContent="center" spacing={2}>
                                    <EmptyNotebookText variant='h5'>This notebook is empty</EmptyNotebookText>
                                    <Button
                                        variant="outlined"
                                        title="Create a new Project"
                                        onClick={() => setDisplayCreationEntityDisplay(true)}
                                    >
                                        Add a new Project
                                    </Button>
                                </Stack>
                            </DashedBox>
                        )
                    )}
                </Box>
            )}
            <ErrorSnackbar
                open={errorSnackbarOpen}
                message={errorSnackbarMessage}
                onClose={() => setErrorSnackbarOpen(false)}
            />
        </Box>

    )
}