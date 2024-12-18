"use client";

import { useState, useEffect } from "react";
import {Box, IconButton, Stack, Typography} from "@mui/material";
import InsertChartIcon from '@mui/icons-material/InsertChart';
import ShareIcon from '@mui/icons-material/Share';
import {Settings} from "@mui/icons-material";

import {getEntity} from "@/app/calls";
import ErrorSnackbar from "@/app/components/ErrorSnackbar";
import EntityBreadcrumbs from "@/app/components/EntityDisplayComponents/EntityBreadcrumbs";
import EntityDisplay from "@/app/components/EntityDisplayComponents/EntityDisplay";


export default function NotebookDisplay({ notebookId, libraryId, libraryName }) {


    const [notebook, setNotebook] = useState({});

    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState("");

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
                    <Stack spacing={2}>
                        {notebook.children && notebook.children.map(child => (
                            <EntityDisplay key={child + "-EntityDisplay"} entityId={child} />
                            ))}
                    </Stack>
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













