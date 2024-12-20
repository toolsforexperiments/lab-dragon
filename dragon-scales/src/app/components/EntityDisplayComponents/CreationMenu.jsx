import {Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Typography} from "@mui/material";
import {Cloud, ContentCopy, ContentCut, ContentPaste} from "@mui/icons-material";

import { creationMenuItems } from "@/app/constants";
import {EntityIcon} from "@/app/components/icons/EntityIcons";

export default function CreationMenu( { entityType, entityName } ) {

    return (
        <Paper sx={{ width: 320, maxWidth: '100%' }}>
            <MenuList>
                <Typography
                    variant="subtitle2"
                    sx={{ px: 2, py: 1, color: 'text.secondary' }}
                >
                    Create New Entities Under <i>{entityName}</i>
                </Typography>
                {creationMenuItems[entityType].map((item) => (
                    <MenuItem key={item}>
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
            </MenuList>
        </Paper>
    )
}











