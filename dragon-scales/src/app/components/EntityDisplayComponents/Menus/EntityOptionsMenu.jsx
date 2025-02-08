"use client"

import {useContext} from "react";
import {ListItemIcon, ListItemText, MenuItem, MenuList, Paper} from "@mui/material";
import AddCommentIcon from '@mui/icons-material/AddComment';

import { EntitiesRefContext} from "@/app/contexts/entitiesRefContext";



export default function EntityOptionsMenu({entityId, handleClose}) {

    const { setNewCommentRequested } = useContext(EntitiesRefContext);

    const requestNewComment = () => {
        setNewCommentRequested(entityId);
        handleClose();
    }


    return (
        <Paper>
            <MenuList>
                <MenuItem onClick={requestNewComment}>
                    <ListItemIcon>
                        <AddCommentIcon/>
                    </ListItemIcon>
                    <ListItemText>Add comment</ListItemText>
                </MenuItem>
            </MenuList>
        </Paper>
    )


}






