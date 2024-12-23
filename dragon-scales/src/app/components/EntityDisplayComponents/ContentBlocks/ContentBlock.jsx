import { Box, styled } from "@mui/material";
import ReactMarkdown from 'react-markdown';

const StyledBlock = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,

    '&:hover': {
        backgroundColor: theme.palette.primary.lighter,
    },

    // Style markdown content
    '& p': {
        margin: 0,
        ...theme.typography.body1
    }
}));

export default function ContentBlock({ contentBlock }) {
    return (
        <StyledBlock>
            <ReactMarkdown>
                {contentBlock.content[contentBlock.content.length - 1]}
            </ReactMarkdown>
        </StyledBlock>
    );
}