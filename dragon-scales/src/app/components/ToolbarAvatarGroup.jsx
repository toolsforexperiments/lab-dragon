import { Box, Tooltip, Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";

import LDAvatar from './AvatarStyled';


const StyledVerticalAvatars = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(1.5),
}));

export default function ToolbarAvatarGroup({ activeUsers }) {
    const userEntries = Object.entries(activeUsers);
    const displayUsers = userEntries.slice(0, 3);
    const extraUsers = userEntries.slice(3);
    const extraCount = extraUsers.length;
    const extraNames = extraUsers.map(([_, value]) => value.name).join(', ');

    return (
        <StyledVerticalAvatars>
            {extraCount > 0 && (
                <Tooltip title={extraNames}>
                    <Avatar key="extra" bgColor="grey" name={`+${extraCount}`} alt={`+${extraCount}`}>
                        +{extraCount}
                    </Avatar>
                </Tooltip>
            )}
            {displayUsers.map(([key, value]) => (
                <LDAvatar key={key} bgColor={value.profile_color} name={value.name} alt={value.name} />
            ))}
        </StyledVerticalAvatars>
    );
}



