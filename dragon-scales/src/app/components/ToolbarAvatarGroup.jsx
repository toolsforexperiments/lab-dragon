

import Link from 'next/link';
import { Box, Tooltip, Avatar, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

import LDAvatar from './AvatarStyled';
import {usePathname} from "next/navigation";


const StyledVerticalAvatars = styled(Button)(({ theme }) => ({
    width: '50px',
    minWidth: '50px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    marginTop: 'auto',
    marginBottom: '12px',
    '&:hover': {
        boxShadow: theme.shadows[6],
    },
}));

export default function ToolbarAvatarGroup({ activeUsers }) {
    const pathname = usePathname();
    const userEntries = Object.entries(activeUsers);
    const displayUsers = userEntries.slice(0, 3);
    const extraUsers = userEntries.slice(3);
    const extraCount = extraUsers.length;
    const extraNames = extraUsers.map(([_, value]) => value.name).join(', ');

    return (
        <Box sx={{
                marginTop: 'auto',  // This pushes it to the bottom
                marginBottom: '12px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
        }}>
            <Link href="/users">
                <StyledVerticalAvatars title="User Management">
                    {extraCount > 0 && (
                        <Tooltip title={extraNames}>
                            <Avatar key="extra" bgColor="grey" name={`+${extraCount}`} alt={`+${extraCount}`}>
                                +{extraCount}
                            </Avatar>
                        </Tooltip>
                    )}
                    {displayUsers.map(([key, value]) => (
                        <LDAvatar key={key + "-LDAvatar"} bgColor={value.profile_color} name={value.name} alt={value.name} />
                    ))}
                </StyledVerticalAvatars>
            </Link>
        </Box>
    );
}



