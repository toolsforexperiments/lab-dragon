
import { Avatar, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { getContrastTextColor, getNameInitials } from "../utils";



const StyledAvatar = styled(Avatar, { shouldForwardProp: (prop) => prop !== 'bgColor'}) (
    ({ theme, bgColor }) => ({
        backgroundColor: bgColor,
        color: getContrastTextColor(bgColor),
    })
)


// Lab Dragon Avatar
export default function LDAvatar({bgColor, name}){
    return (
        <Tooltip title={name}>
            <StyledAvatar bgColor={bgColor}>
                {getNameInitials(name)}
            </StyledAvatar>
        </Tooltip>
    )
}







