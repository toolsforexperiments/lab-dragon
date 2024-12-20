"use client"

import { useState, useEffect, useContext, useRef } from "react";
import {Box, Typography, Card, CardHeader, CardContent, Stack, TextField, IconButton, Popover} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import {Add} from "@mui/icons-material";


import { getEntity, createEntity } from "@/app/calls";
import { entityHeaderTypo, creationMenuItems } from "@/app/constants";
import TypeChip from "@/app/components/EntityDisplayComponents/TypeChip";
import { UserContext } from "@/app/contexts/userContext";
import CreationMenu from "@/app/components/EntityDisplayComponents/CreationMenu";

const Header=styled(CardHeader, {shouldForwardProp: (prop) => prop !== 'entityType'} )(
    ({ theme, entityType }) => ({
        color: theme.palette.entities.text[entityType],
        backgroundColor: theme.palette.entities.background[entityType],
    })
);

const HoverAddSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    width: '98%',
    left: '16px',
    borderRadius: '10px',
    bottom: '5px',
    marginBottom: '15px',
    opacity: 0,
    color: theme.palette.text.light,
    transition: 'opacity 0.3s'

}));

const HoverCard = styled(Card)(({ theme }) => ({
    margin: 'inherit',
    position: 'relative',
    '&:hover': {
        '& > *:last-child': { 
            opacity: 1,
            backgroundColor: theme.palette.background.light,
        }
    }
}));

const ActionHint = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.light,
    transition: 'opacity 0.3s',
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
    toggleParentCreationEntityDisplay,
    setParentErrorSnackbarOpen, 
    setParentErrorSnackbarMessage,
    }) {

    const [entity, setEntity] = useState({})
    const [newNameHolder, setNewNameHolder] = useState("");
    const [openCreationEntityDisplay, setOpenCreationEntityDisplay] = useState(false);

    // Creation menu state
    const [anchorEl, setAnchorEl] = useState(null);
    const [openCreationMenu, setOpenCreationMenu] = useState(false);

    const textFieldRef = useRef(null);
    
    const { activeUsersEmailStr } = useContext(UserContext);

    const reload = () => {
        reloadParent();
        reloadTrees();
    }

    const toggleCreationEntityDisplay = () => {
        setOpenCreationEntityDisplay(!openCreationEntityDisplay);
    }

    // Add handler for IconButton click
    const handleAddClick = (event) => {
        setAnchorEl(event.currentTarget);
        setOpenCreationMenu(true);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setOpenCreationMenu(false);
    };

    // TODO: Add snackbar error if this fails
    const reloadEntity = () => {
        getEntity(entityId).then((data) => {
            if (data) {
                setEntity(JSON.parse(data));
            } else {
                setEntity(null);
            }
        });
    }

    // Loads the entity on component creation
    // TODO: Add snackbar error if this fails
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

    // Ensures the text field is focused when creating a new entity
    useEffect(() => {
        if (entityId === null && textFieldRef.current) {
            // Small timeout to ensure the TextField is fully rendered
            setTimeout(() => {
                textFieldRef.current.focus();
            }, 0);
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
        toggleParentCreationEntityDisplay();
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
                                    inputRef={textFieldRef}                                
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
                            <EntityDisplay key={child}
                                           entityId={child}
                                           reloadParent={reloadEntity}
                                           reloadTrees={reloadTrees}
                                           toggleParentCreationEntityDisplay={toggleCreationEntityDisplay}
                            />
                        ))}

                        {openCreationEntityDisplay && (
                            <EntityDisplay entityId={null}
                                           parentId={entityId}
                                           reloadParent={reloadEntity}
                                           reloadTrees={reloadTrees}
                                           entityType={creationMenuItems[entity.type][creationMenuItems[entity.type].length - 1]}
                                           toggleParentCreationEntityDisplay={toggleCreationEntityDisplay}
                                           setParentErrorSnackbarOpen={setParentErrorSnackbarOpen}
                                           setParentErrorSnackbarMessage={setParentErrorSnackbarMessage}
                            />
                        )}
                    </Stack>
                </CardContent>
                <HoverAddSection>
                    <IconButton onClick={handleAddClick}>
                        <Add />
                    </IconButton>
                        <ActionHint variant="body1" sx={{ color: '#0000004D',}}>Click the plus icon to add a story entity or content block</ActionHint>
                </HoverAddSection>
                <Popover
                    open={openCreationMenu}
                    anchorEl={anchorEl}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                }}>
                    <CreationMenu entityType={entity.type}
                                  entityName={entity.name}
                                  onClose={handleMenuClose}
                                  actions={[toggleParentCreationEntityDisplay, toggleCreationEntityDisplay]} />
                </Popover>
            </HoverCard>
        )
    )

}







