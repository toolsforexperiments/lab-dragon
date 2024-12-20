"use client"

import { useState, useEffect, useContext } from "react";
import {Box, Typography, Card, CardHeader, CardContent, Stack, TextField, IconButton} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ClickAwayListener } from '@mui/base/ClickAwayListener';


import { getEntity, createEntity } from "@/app/calls";
import {entityHeaderTypo} from "@/app/constants";
import TypeChip from "@/app/components/EntityDisplayComponents/TypeChip";
import { UserContext } from "@/app/contexts/userContext";
import {Add} from "@mui/icons-material";

const Header=styled(CardHeader, {shouldForwardProp: (prop) => prop !== 'entityType'} )(
    ({ theme, entityType }) => ({
        color: theme.palette.entities.text[entityType],
        backgroundColor: theme.palette.entities.background[entityType],
    })
);

const HoverAddButton = styled(IconButton)(({ theme }) => ({
    position: 'relative',
    left: '16px',
    bottom: '5px',
    marginBottom: '15px',
    opacity: 0,
    color: 'red',
    transition: 'opacity 0.3s'
}));

const HoverCard = styled(Card)(({ theme }) => ({
    margin: 'inherit',
    position: 'relative',
    '&:hover': {
        '& > *:last-child': { 
            opacity: 1,
        }
    }
}));

const NewEntityNameTextField = styled(TextField, {shouldForwardProp: (prop) => prop !== 'entityType'} )(
    ({ theme, entityType }) => ({
        '& .MuiInputBase-input': {
            color: theme.palette.entities.text[entityType],
        },
        '& .MuiInputLabel-root': {
            color: theme.palette.entities.text[entityType],
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: theme.palette.entities.text[entityType]
            },
            '&:hover fieldset': {
                borderColor: theme.palette.entities.text[entityType]
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.entities.text[entityType]
            },
        },
    })
);


export default function EntityDisplay({ entityId, 
    parentId,
    reloadParent, 
    reloadTrees,
    entityType, 
    toggleCreationEntityDisplay, 
    setParentErrorSnackbarOpen, 
    setParentErrorSnackbarMessage, 
    }) {

    const [entity, setEntity] = useState({})
    const [newNameHolder, setNewNameHolder] = useState("");

    const { activeUsersEmailStr } = useContext(UserContext);

    const reload = () => {
        reloadParent();
        reloadTrees();
    }


    useEffect(() => {
        if (entityId) {
            getEntity(entityId).then((data) => {
                if (data) {
                    setEntity(JSON.parse(data));
                } else {
                    setEntity(null);
                }
            });
        }
    }, [entityId]);

    const handleClickAway = () => {
        if (newNameHolder !== "") {
            createEntity(newNameHolder, activeUsersEmailStr, entityType, parentId).then((ret) => {
                if (ret === true) {
                    reload();
                } else {
                    setParentErrorSnackbarMessage(`Error creating new ${entityType}, please try again.`);
                    setParentErrorSnackbarOpen(true);
                    reload();
                }
            });
        }
        toggleCreationEntityDisplay();
    };

    return (
        entity === null ? (
            <Typography variant="h3">Error loading entity with id {entityId} please try again</Typography>
        ) : entityId === null ? (
            <ClickAwayListener onClickAway={handleClickAway}>
                <Box>
                    <Card sx={{ margin: 'inherit'}}>
                        <Header title={
                            <Box display="flex" alignItems="center">
                                <TypeChip type={entityType} />
                                <NewEntityNameTextField
                                    autoFocus
                                    autoComplete="off"
                                    fullWidth
                                    label={`Enter new ${entityType} name`}
                                    value={newNameHolder}
                                    onChange={(e) => setNewNameHolder(e.target.value)}
                                    entityType={entityType}
                                />
                            </Box>
                        }
                            entityType={entityType}/>
                        <CardContent />
                    </Card>
                </Box>
            </ClickAwayListener>
        ) : Object.keys(entity).length === 0 ? (
            <Typography variant="h3">Loading...</Typography>
        ) : (
            <HoverCard sx={{ margin: 'inherit', position: 'relative' }}>
                <Header title={
                        <Box display="flex" alignItems="center">
                            <TypeChip type={entity.type} />
                            <Typography variant={entityHeaderTypo[entity.type]}>
                                {entity.name}
                            </Typography>
                        </Box>
                    }
                    entityType={entity.type}
                />
                <CardContent>
                    <Stack spacing={2}>
                        {entity.children && entity.children.map(child => (
                            <EntityDisplay key={child} entityId={child} />
                        ))}
                    </Stack>
                </CardContent>
                <HoverAddButton
                    onClick={() => {console.log("clicked")}}
                >
                    <Add />
                </HoverAddButton>
            </HoverCard>
        )
    )

}







