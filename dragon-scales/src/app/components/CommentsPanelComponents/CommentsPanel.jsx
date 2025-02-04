import {Box, Drawer, Typography} from "@mui/material";
import {styled} from "@mui/material/styles";



const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'drawerWidth' })(({ theme, drawerWidth }) => ({
    position: "relative",
    anchor: "right",
    height: "100%",
    width: drawerWidth,
    flexShrink: 0,
    backgroundColor: "transparent",
    borderRadius: "16px",
    border: "none",

    "& .MuiDrawer-paper": {
        width: drawerWidth,
        boxSizing: "border-box",
        position: "relative",
        backgroundColor: "transparent",
        border: "none",
        borderRadius: "16px",
    },
}));



export default function CommentsPanel({open, onClose, drawerWidth}) {

        return (
            <StyledDrawer variant="persistent" anchor="right" open={open} onClose={onClose} drawerWidth={drawerWidth}>
                <Typography>Hello testing testing</Typography>
            </StyledDrawer>
        );
}







