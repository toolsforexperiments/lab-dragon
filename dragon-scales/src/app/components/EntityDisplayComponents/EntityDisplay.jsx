"use client"

import {useState, useEffect, useContext, useRef} from "react";
import {
    Box,
    Typography,
    Card,
    CardHeader,
    CardContent,
    Stack,
    TextField,
    IconButton,
    Popover,
    Dialog, DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material";
import {styled, useTheme} from "@mui/material/styles";
import {ClickAwayListener} from '@mui/base/ClickAwayListener';
import {Add} from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import {getEntity, createEntity, deleteEntity, editEntityName, addImageLinkBlock} from "@/app/calls";
import {entityHeaderTypo, creationMenuItems} from "@/app/constants";
import TypeChip from "@/app/components/EntityDisplayComponents/TypeChip";
import {UserContext} from "@/app/contexts/userContext";
import CreationMenu from "@/app/components/EntityDisplayComponents/Menus/CreationMenu";
import ContentBlock from "@/app/components/EntityDisplayComponents/ContentBlocks/ContentBlock";
import TextBlockEditor from "@/app/components/EntityDisplayComponents/ContentBlocks/TextBlockEditor";
import ImageBlockDrop from "@/app/components/EntityDisplayComponents/ContentBlocks/ImageBlockDrop";
import TargetIcon from "@/app/components/icons/TargetIcon";
import TargetingMenu from "@/app/components/EntityDisplayComponents/Menus/TargetingMenu";
import {EntitiesRefContext} from "@/app/contexts/entitiesRefContext";
import EntityOptionsMenu from "@/app/components/EntityDisplayComponents/Menus/EntityOptionsMenu";

const Header = styled(CardHeader, {shouldForwardProp: (prop) => prop !== 'entityType'})(
    ({theme, entityType}) => ({
        color: theme.palette.entities.text[entityType],
        backgroundColor: theme.palette.entities.background[entityType],
        '& .MuiButtonBase-root': {
            opacity: 0,
            transition: 'opacity 0.3s',
            marginRight: "10px",
            color: theme.palette.buttons.iconButton.entityHeader,
        },
        '&:hover .MuiButtonBase-root': {
            opacity: 1,
        }
    })
);

const HoverAddSection = styled(Box)(({theme}) => ({
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

const HoverCard = styled(Card)(({theme}) => ({
    margin: 'inherit',
    position: 'relative',
    '&:hover': {
        '& > *:last-child': {
            opacity: 1,
            backgroundColor: theme.palette.background.light,
        }
    }
}));

const ActionHint = styled(Typography)(({theme}) => ({
    color: theme.palette.text.light,
    transition: 'opacity 0.3s',
}));


const RelativeAddButton = styled(IconButton, {shouldForwardProp: (prop) => prop !== 'show'})(
    ({theme, show}) => ({
        width: 'fit-content',
        height: 'fit-content',
        marginLeft: -10,
        marginRight: 8,
        opacity: show? 1 : 0,
        transition: 'opacity 0.3s ease',

}));



const NewEntityNameTextField = styled(TextField, {shouldForwardProp: (prop) => prop !== 'entityType'})(
    ({theme, entityType}) => ({
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


export default function EntityDisplay({
                                          entityId,
                                          parentId,
                                          reloadParent,
                                          reloadTrees,
                                          entityType,
                                          toggleParentCreationEntityDisplay,
                                          setParentErrorSnackbarOpen,
                                          setParentErrorSnackbarMessage,
                                          underChildId,
                                      }) {

    const theme = useTheme();

    const [entity, setEntity] = useState({})
    const [newNameHolder, setNewNameHolder] = useState("");
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openEditNameTextField, setOpenEditNameTextField] = useState(false);
    // Used to keep track of the current hover state of the card
    const [currentHover, setCurrentHover] = useState("");

    // The open states variables hold the ID of what thing the creation menu should be under what
    const [openCreationEntityDisplay, setOpenCreationEntityDisplay] = useState("");
    const [openNewImageBlock, setOpenNewImageBlock] = useState("");
    const [openNewTextBlock, setOpenNewTextBlock] = useState("");
    const [newTextBlockEditorState, setNewTextBlockEditorState] = useState("");

    // Changes whenever the user presses the plus icon, used to keep track of the ID of the last clicked item to send to the creation menu.
    const [lastClickedItemId, setLastClickedItemId] = useState("");

    // Creation menu state
    const [anchorCreationMenu, setAnchorCreationMenu] = useState(null);
    const [openCreationMenu, setOpenCreationMenu] = useState(false);

    // Targeting menu
    const [anchorTargetingMenu, setAnchorTargetingMenu] = useState(null);
    const [openTargetingMenu, setOpenTargetingMenu] = useState(false);

    // More options menu
    const [anchorMoreOptionsMenu, setAnchorMoreOptionsMenu] = useState(null);
    const [openMoreOptionsMenu, setOpenMoreOptionsMenu] = useState(false);

    const textFieldRef = useRef(null);
    const contentBlocksIndex = useRef({});
    // used to handle scrolling to entity
    const entityRef = useRef(null)

    const { entitiesRef, commentsIndex, setCommentsIndex } = useContext(EntitiesRefContext);
    const {activeUsersEmailStr} = useContext(UserContext);

    const reload = () => {
        // Stops nextjs from caching the image to allow for real time updates
        const timestamp = new Date().getTime();

        // Stops it from asking null for the entity
        if (entity) {
            reloadEntity();
        }
        reloadParent();
        reloadTrees();
    }

    const handleImageLinkBlockCreation = (imagePath, instanceId) => {
        addImageLinkBlock(entityId, activeUsersEmailStr, imagePath, instanceId, lastClickedItemId).then((ret) => {
            if (ret === true) {
                reload();
            } else {
                setParentErrorSnackbarMessage(`Error creating new image block, please try again.`);
                setParentErrorSnackbarOpen(true);
                reload();
            }
        });
    }

    const onOpenEditTextField = () => {
        setNewNameHolder(entity.name);
        setOpenEditNameTextField(true);
    }

    const onCloseEditTextField = () => {
        setOpenEditNameTextField(false);
    }

    const handleEditName = () => {
        onCloseEditTextField();
        if (newNameHolder !== entity.name) {
            editEntityName(entityId, newNameHolder).then((ret) => {
                if (ret === true) {
                    reload();
                } else {
                    setParentErrorSnackbarMessage(`Error editing ${entity.type}, please try again.`);
                    setParentErrorSnackbarOpen(true);
                    reload();
                }
            });
        }
    }

    const onDeleteDialogOpen = () => {
        setOpenDeleteDialog(true);
    }

    const onDeleteDialogClose = () => {
        setOpenDeleteDialog(false);
    }

    const handleDeleteEntity = () => {
        setOpenDeleteDialog(false);
        deleteEntity(entityId, activeUsersEmailStr).then((ret) => {
            if (ret === true) {
                reload();
            } else {
                setParentErrorSnackbarMessage(`Error deleting ${entity.type}, please try again.`);
                setParentErrorSnackbarOpen(true);
                reload();
            }
        });
    }

    const onHover = (itemId) => {
        setCurrentHover(itemId);
    }

    const toggleCreationEntityDisplay = (itemId) => {
        if (openCreationEntityDisplay !== "") {
            setOpenCreationEntityDisplay("");
        } else {
            setOpenCreationEntityDisplay(itemId);
        }
    }

    // targeting menu
    const handleTargetClick = (event) => {
        event.stopPropagation();
        setAnchorTargetingMenu(event.currentTarget);
        setOpenTargetingMenu(true);
    }

    const handleTargetMenuClose = () => {
        setOpenTargetingMenu(false);
        setAnchorTargetingMenu(null);
    }

    // more options menu
    const handleMoreOptionsMenuClick = (event) => {
        event.stopPropagation();
        setAnchorMoreOptionsMenu(event.currentTarget);
        setOpenMoreOptionsMenu(true);
    }

    const handleMoreOptionsMenuClose = () => {
        setOpenMoreOptionsMenu(false);
        setAnchorMoreOptionsMenu(null);
    }

    // Add handler for IconButton click
    const handleAddClick = (event, itemId) => {
        setAnchorCreationMenu(event.currentTarget);
        setLastClickedItemId(itemId)
        setOpenCreationMenu(true);
    };

    const handleMenuClose = () => {
        setAnchorCreationMenu(null);
        setOpenCreationMenu(false);
        setLastClickedItemId("");
        setOpenCreationEntityDisplay("");
        setOpenNewTextBlock("");
        setOpenNewImageBlock("");
    };

    // TODO: Add snackbar error if this fails
    const reloadEntity = () => {
        getEntity(entityId).then((data) => {
            if (data) {
                let ent = JSON.parse(data);
                ent.content_blocks = ent.content_blocks.map((block) => {
                    const parsedBlock = JSON.parse(block);
                    contentBlocksIndex.current[parsedBlock.ID] = parsedBlock;
                    return parsedBlock;
                });
                ent.comments = ent.comments.map((comment) => {
                    let parsedComment = JSON.parse(comment);
                    parsedComment.replies = parsedComment.replies.map((reply) => {
                        return JSON.parse(reply);

                    });
                    setCommentsIndex(prev => { 
                        return {
                            ...prev,
                            [parsedComment.ID]: parsedComment
                        }
                    });

                    return parsedComment;
                })
                setEntity(ent);
                // Registering this entity in the entitiesRef. Both its ref as well as its reload function.
                if (entityRef.current) {
                    entitiesRef.current[entityId] = {"ref": entityRef, "reload": reloadEntity};
                }

            } else {
                setEntity(null);
            }
        });
    }

    // Loads the entity on component creation
    // TODO: Add snackbar error if this fails
    useEffect(() => {
        if (entityId) {
            reloadEntity();
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
            createEntity(newNameHolder, activeUsersEmailStr, entityType, parentId, underChildId).then((ret) => {
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

    if (entity && entity.deleted === true){
        return null;
    }

    return (
        // entity starts as an empty object, if it is every null an error has occurred
        entity === null ? (
            <Typography variant="h3">Error loading entity with id {entityId} please try again</Typography>
            // If entityId is null, it means that his EntityDisplay is the placeholder where the user inserts the new title.
        ) : entityId === null ? (
            <ClickAwayListener onClickAway={handleClickAway}>
                <Box>
                    <Card sx={{margin: 'inherit'}}>
                        <Header title={
                            <Box display="flex" alignItems="center">
                                <TypeChip type={entityType}/>
                                <NewEntityNameTextField
                                    inputRef={textFieldRef}
                                    autoFocus
                                    autoComplete="off"
                                    fullWidth
                                    label={`Enter new ${entityType} name`}
                                    value={newNameHolder}
                                    onChange={(e) => setNewNameHolder(e.target.value)}
                                    entityType={entityType}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.stopPropagation();
                                            handleClickAway();
                                        }
                                    }}
                                />
                            </Box>
                        }
                                entityType={entityType}/>
                        <CardContent/>
                    </Card>
                </Box>
            </ClickAwayListener>
            // If entity is an empty object, it means that the entity is still loading
        ) : Object.keys(entity).length === 0 ? (
            <Typography variant="h3">Loading...</Typography>

            // the last option is the loaded entity display we actually want to show
        ) : (
            <HoverCard sx={{margin: 'inherit', position: 'relative'}} ref={entityRef}>
                <Header title={
                    openEditNameTextField ? (
                        <ClickAwayListener onClickAway={handleEditName}>
                            <NewEntityNameTextField
                                autoFocus
                                autoComplete="off"
                                fullWidth
                                label={`Edit ${entity.type} name`}
                                value={newNameHolder}
                                onChange={(e) => setNewNameHolder(e.target.value)}
                                entityType={entity.type}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.stopPropagation();
                                        handleEditName();
                                    }
                                }}
                            />
                        </ClickAwayListener>
                    ) : (
                        <Box display="flex" flexDirection="row" justifyContent="space-between" onDoubleClick={onOpenEditTextField}>
                            <Box display="flex" alignItems="center">
                                <TypeChip type={entity.type}/>
                                <Typography variant={entityHeaderTypo[entity.type]}>
                                    {entity.name}
                                </Typography>
                            </Box>
                            <Box>
                                <IconButton onClick={handleTargetClick}>
                                    <TargetIcon sx={{color: theme.palette.buttons.iconButton.entityHeader}}/>
                                </IconButton>
                                
                                <IconButton onClick={onDeleteDialogOpen}>
                                    <DeleteIcon sx={{color: "red"}}/>
                                </IconButton>

                                <IconButton onClick={handleMoreOptionsMenuClick}>
                                    <MoreVertIcon/>
                                </IconButton>

                            </Box>
                        </Box>
                    )
                }
                        entityType={entity.type}
                />
                <CardContent>
                    <Stack spacing={1}>
                        {entity.order && entity.order.map(([child, type, show]) => show==="True" && (
                            <Box display="flex" flexDirection="row" alignItems="top" width="100%" flex={1} key={child} onMouseEnter={() => onHover(child)}>
                                <RelativeAddButton show={currentHover === child}
                                    onClick={(e) => handleAddClick(e, child)} >
                                    <Add/>
                                </RelativeAddButton>
                                <Box flex={1}>
                                    {type === "entity" ? (
                                        <EntityDisplay
                                            entityId={child}
                                            reloadParent={reloadEntity}
                                            reloadTrees={reloadTrees}
                                            toggleParentCreationEntityDisplay={toggleCreationEntityDisplay}
                                        />
                                    ) : (
                                        <ContentBlock  contentBlock={contentBlocksIndex.current[child]}
                                                      parentId={entity.ID} reloadParent={reloadEntity}/>
                                    )}

                                    {openNewTextBlock === child && (
                                        <TextBlockEditor parentId={entityId}
                                                         onEditorChange={setNewTextBlockEditorState}
                                                         initialContent={newTextBlockEditorState}
                                                         editorState={newTextBlockEditorState}
                                                         onClose={() => setOpenNewTextBlock("")}
                                                         reloadParent={reloadEntity}
                                                         underChild={child}
                                        />
                                    )}

                                    {openNewImageBlock === child && (
                                        <ImageBlockDrop parentId={entityId}
                                                        reloadParent={reloadEntity}
                                                        handleOnClose={() => setOpenNewImageBlock("")}
                                                        underChild={child}/>

                                    )}

                                    {/* Empty EntityDisplay for the user to insert new name */}
                                    {openCreationEntityDisplay === child && (
                                        <EntityDisplay entityId={null}
                                                       parentId={entityId}
                                                       reloadParent={reloadEntity}
                                                       reloadTrees={reloadTrees}
                                                       entityType={creationMenuItems[entity.type][creationMenuItems[entity.type].length - 1]}
                                                       toggleParentCreationEntityDisplay={() => toggleCreationEntityDisplay(child)}
                                                       setParentErrorSnackbarOpen={setParentErrorSnackbarOpen}
                                                       setParentErrorSnackbarMessage={setParentErrorSnackbarMessage}
                                                       underChildId={child}
                                        />
                                    )}
                                </Box>
                            </Box>
                        ))}

                        {openNewTextBlock === entityId && (
                            <TextBlockEditor parentId={entity.ID}
                                             onEditorChange={setNewTextBlockEditorState}
                                             initialContent={newTextBlockEditorState}
                                             editorState={newTextBlockEditorState}
                                             onClose={() => setOpenNewTextBlock("")}
                                             reloadParent={reloadEntity}
                            />
                        )}

                        {openNewImageBlock === entityId && (
                            <ImageBlockDrop parentId={entityId}
                                            reloadParent={reloadEntity}
                                            handleOnClose={() => setOpenNewImageBlock("")}/>

                        )}

                        {/* Empty EntityDisplay for the user to insert new name */}
                        {openCreationEntityDisplay === entityId && (
                            <EntityDisplay entityId={null}
                                           parentId={entityId}
                                           reloadParent={reloadEntity}
                                           reloadTrees={reloadTrees}
                                           entityType={creationMenuItems[entity.type][creationMenuItems[entity.type].length - 1]}
                                           toggleParentCreationEntityDisplay={() => toggleCreationEntityDisplay(entityId)}
                                           setParentErrorSnackbarOpen={setParentErrorSnackbarOpen}
                                           setParentErrorSnackbarMessage={setParentErrorSnackbarMessage}
                            />
                        )}
                    </Stack>
                </CardContent>
                <HoverAddSection
                    onClick={(e) => handleAddClick(e, entityId)}
                    sx={{cursor: "pointer"}}>
                    <IconButton>
                        <Add/>
                    </IconButton>
                    <ActionHint variant="body1" sx={{color: '#0000004D',}}>Click the plus icon to add a story entity or
                        content block</ActionHint>
                </HoverAddSection>

                {/* Targeting Menu */}
                <Popover
                    open={openTargetingMenu}
                    anchorEl={anchorTargetingMenu}
                    onClose={handleTargetMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    marginThreshold={16}
                    sx={{
                        transform: 'translateX(-50px)',
                    }}
                >
                    <TargetingMenu entity={entity}/>
                </Popover>

                {/* More Options Menu */}
                <Popover
                    open={openMoreOptionsMenu}
                    anchorEl={anchorMoreOptionsMenu}
                    onClose={handleMoreOptionsMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    marginThreshold={16}
                    sx={{
                        transform: 'translateX(-50px)',
                    }}
                >
                    <EntityOptionsMenu entityId={entityId} handleClose={handleMoreOptionsMenuClose}/>
                </Popover>

                {/* Menu that pops up when the plus is pressed */}
                <Popover
                    open={openCreationMenu}
                    anchorEl={anchorCreationMenu}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    marginThreshold={200}
                    keepMounted={false}
                    disablePortal={false}
                >
                    <CreationMenu entityId={entity.ID}
                                  entityType={entity.type}
                                  entityName={entity.name}
                                  onClose={handleMenuClose}
                                  actions={[toggleParentCreationEntityDisplay, () => toggleCreationEntityDisplay(lastClickedItemId)]}
                                  openTextBlock={() => setOpenNewTextBlock(lastClickedItemId)}
                                  openImageBlock={() => setOpenNewImageBlock(lastClickedItemId)}
                                  handleImageLink={handleImageLinkBlockCreation}/>
                </Popover>

                <Dialog open={openDeleteDialog} onClose={onDeleteDialogClose}>
                    <DialogTitle>Delete Entity</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete "{entity.name}"? This action cannot be undone without contacting the administrator.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onDeleteDialogClose}>Cancel</Button>
                        <Button onClick={handleDeleteEntity} color="error">Delete</Button>
                    </DialogActions>
                </Dialog>
            </HoverCard>
        )
    )
}







