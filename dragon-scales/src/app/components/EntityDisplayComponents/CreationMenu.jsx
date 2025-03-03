"use client"

import {Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, TextField, Typography} from "@mui/material";
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import ImageIcon from '@mui/icons-material/Image';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

import { creationMenuItems } from "@/app/constants";
import {EntityIcon} from "@/app/components/icons/EntityIcons";
import {useEffect, useState} from "react";
import {getImageSuggestions} from "@/app/calls";

// FIXME: This should just accept the whole entity object at this point.
export default function CreationMenu( { entityId, entityType, entityName, onClose, actions, openTextBlock, openImageBlock, handleImageLink } ) {

    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const handleOnQueryChange = (event) => {
        setQuery(event.target.value);
        event.stopPropagation();
    }

    const handleTextFieldKeyDown = (event) => {
        // Allow up and down arrow keys to pass through for menu navigation
        // Stop propagation for all other keys to prevent menu selection while typing
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
            event.stopPropagation();
        }
    }

    const handleOnCloseEntity = (index) => {
        onClose();
        actions[index]();
    }

    const handleOnCloseAction = (closeAction) => {
        onClose();
        closeAction();
    }

    const handleImageLinkAction = (imagePath, instanceID) => {
        onClose();
        handleImageLink(imagePath, instanceID);
    }

    useEffect(() => {
        getImageSuggestions(entityId, query).then((response) => {
            if (response) {
                setSearchResults(JSON.parse(response));
            }
        });

    }, [query]);

    return (
        <Paper sx={{ maxWidth: '100%' }}>
            <MenuList>
                <Typography
                    variant="subtitle2"
                    sx={{ px: 2, py: 1, color: 'text.secondary' }}
                >
                    Create New Entities Under <i>{entityName}</i>
                </Typography>
                {creationMenuItems[entityType].map((item, index) => (
                    <MenuItem key={item} onClick={() => handleOnCloseEntity(index)}>
                        <ListItemIcon>
                            <EntityIcon type={item} fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{item}</ListItemText>
                        {/* TODO: Add keyboard shortcut */}
                        {/* <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        ??
                        </Typography> */}

                    </MenuItem>
                ))}
                <Divider />
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
                    Content Blocks
                </Typography>
                <MenuItem onClick={() => handleOnCloseAction(openTextBlock)}>
                    <ListItemIcon> <FormatAlignLeftIcon /> </ListItemIcon>
                    <ListItemText>Text Block</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleOnCloseAction(openImageBlock)}>
                    <ListItemIcon><ImageIcon/></ListItemIcon>
                    <ListItemText>Image Block</ListItemText>
                </MenuItem>

                <Divider />
                
                <MenuItem sx={{ py: 1 }}>
                    <TextField 
                        fullWidth
                        size="small"
                        placeholder="Search for image suggestions"
                        value={query}
                        onChange={handleOnQueryChange}
                        onKeyDown={handleTextFieldKeyDown}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </MenuItem>
                {Object.keys(searchResults).slice(0, 5).map((result) => (
                    <MenuItem key={result} onClick={() => handleOnCloseAction(() => handleImageLinkAction(searchResults[result][0], searchResults[result][1]))}>
                        <ListItemIcon>
                            <ImageIcon />
                        </ListItemIcon>
                        <ListItemText>{result}</ListItemText>
                    </MenuItem>
                ))}
                

            </MenuList>
        </Paper>
    )
}











