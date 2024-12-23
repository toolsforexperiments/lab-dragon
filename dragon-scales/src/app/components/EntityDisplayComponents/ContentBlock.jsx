import { Typography, styled } from "@mui/material";

const StyledBlock = styled(Typography)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,

    '&:hover': {
        backgroundColor: theme.palette.primary.lighter,
    }
}));

export default function ContentBlock({ contentBlock }) {
    return (
        <StyledBlock variant="body 2">{contentBlock.content[contentBlock.content.length - 1]}</StyledBlock>
    );
}






