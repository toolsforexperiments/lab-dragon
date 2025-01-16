"use client"

import {Box, Button, IconButton, Typography, Snackbar, Tooltip, ImageList, ImageListItem} from "@mui/material";
import {use, useEffect, useState} from "react";
import {getEntity} from "@/app/calls";
import {styled} from "@mui/material/styles";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {keyframes} from "@mui/system";
import {alpha} from "@mui/material/styles";


const TopBanner = styled(Box)(({theme}) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

const InfoBox = styled(Box)(({theme}) => ({
    // backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

const HoverableText = styled(Box)(({theme}) => {
    const flash = keyframes`
        0% { background-color: transparent; }
        50% { background-color: ${alpha(theme.palette.primary.light, 1)}; }
        100% { background-color: transparent; }
    `;

    return {
        cursor: 'pointer',
        padding: '2px 4px',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.light, 1),
        },
        '&.flash': {
            animation: `${flash} 0.5s ease-out`,
        }
    };
});

const ImageBox = styled(Box)(({theme}) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
}));

export default function Instance({ params }) {

    const unwrappedParams = use(params);

    const [instance, setInstance] = useState({"ID": unwrappedParams.id});
    const [invalidInstance, setInvalidInstance] = useState(false);
    const [copiedStates, setCopiedStates] = useState({});

    const getDuration = () => {
        if (instance.end_time && instance.start_time) {
            return `${Math.round((new Date(instance.end_time) - new Date(instance.start_time)) / 1000)} seconds`;
        } else {
            return 'N/A';
        }
    }

    
    useEffect(() => {
        getEntity(instance.ID).then(data => {
            if (data) {
                setInstance(JSON.parse(data));
            } else {
                setInvalidInstance(true);
            }
        });

    }, [instance.ID]);

    const handleCopy = (path) => {
        navigator.clipboard.writeText(path);
        setCopiedStates(prev => ({...prev, [path]: true}));
        
        // Reset the "Copied!" state after 2 seconds
        setTimeout(() => {
            setCopiedStates(prev => ({...prev, [path]: false}));
        }, 2000);
    };

    if (invalidInstance === true) {
        return (
            <Typography variant="h2">Instance of ID "{instance.ID}" does not exists, go to a correct ID instance.</Typography>


        )
    }


    return (
        <Box>
            <TopBanner>
                <Typography variant="h4">{instance.name}</Typography>
            </TopBanner>

            <InfoBox>
                <Typography variant="h6"> Info Box </Typography>
                <Typography variant="body1"> <b>ID:</b> {instance.ID} </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Typography variant="body1" sx={{ width: '100px', flexShrink: 0 }}><b>Data Path:</b></Typography>
                    <Box>
                        {instance.data && instance.data.map((data) => (
                            <Box key={data} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Tooltip 
                                    title={copiedStates[data] ? "Copied!" : "Click to copy path"}
                                    placement="right"
                                >
                                    <HoverableText
                                        onClick={() => handleCopy(data)}
                                        className={copiedStates[data] ? 'flash' : ''}
                                    >
                                        <Typography variant="body1">{data}</Typography>
                                    </HoverableText>
                                </Tooltip>
                            </Box>
                        ))}
                    </Box>
                </Box>
                <Typography variant="body1"> <b>Duration:</b> {getDuration()} <b>Start:</b> {new Date(instance.start_time).toLocaleString()} <b>End:</b> {new Date(instance.end_time).toLocaleString()}</Typography>
            </InfoBox>

            <ImageBox>
                <Typography variant="h6">Images</Typography>
                {instance.images && instance.images.length > 0 ? (
                    <ImageList sx={{ width: '100%' }} cols={3} rowHeight={300} gap={8}>
                        {instance.images.map((img, index) => (
                            <ImageListItem key={index}>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/data/instance_image/${encodeURIComponent(img.replace(/\//g, '#'))}`}
                                    alt={`Instance image ${index + 1}`}
                                    loading="lazy"
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                ) : (
                    <Typography variant="body1">No images available</Typography>
                )}
            </ImageBox>
        </Box>
    )

}


