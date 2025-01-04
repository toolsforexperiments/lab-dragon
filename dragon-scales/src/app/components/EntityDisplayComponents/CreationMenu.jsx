import {Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Typography} from "@mui/material";
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import ImageIcon from '@mui/icons-material/Image';

import { creationMenuItems } from "@/app/constants";
import {EntityIcon} from "@/app/components/icons/EntityIcons";

export default function CreationMenu( { entityType, entityName, onClose, actions, openTextBlock, openImageBlock } ) {

    const handleOnCloseEntity = (index) => {
        onClose();
        actions[index]();
    }

    const handleOnCloseAction = (closeAction) => {
        onClose();
        closeAction();
    }

    return (
        <Paper sx={{ width: 320, maxWidth: '100%' }}>
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



            </MenuList>
        </Paper>
    )
}











