"use client";
import { useEffect, useState } from "react";

import { Box, Typography } from "@mui/material";

import ErrorSnackbar from "@/app/components/ErrorSnackbar";
import { getEntity } from "@/app/calls";


export default function Library({ params }) {

    const [library, setLibrary] = useState({});

    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState("");


    useEffect(() => {
        getEntity(params.id).then((data) => {
            if (data) {
                setLibrary(JSON.parse(data));
            } else {
                setLibrary(null)
                setErrorSnackbarOpen(true);
                setErrorSnackbarMessage("Error getting library");

            }
        });
    }, [params.id]);


    console.log(library);
    return (
        <Box>
            {library === null ? (
                <Typography variant="h1">Error loading library. Please try again.</Typography>
            ) : Object.keys(library).length === 0 ? (
                <Typography variant="h6">Loading...</Typography>
            ) : (
                <Box>
                    <Typography variant="h1">{library.name}</Typography>
                    <Typography variant="h3">{JSON.stringify(library)}</Typography>
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








