import {useState} from "react";

import {Box, Card, CardContent, CardHeader, CardMedia, styled, Typography} from "@mui/material";
import ReactMarkdown from 'react-markdown';
import ImageIcon from '@mui/icons-material/Image';

import TextBlockEditor from "@/app/components/EntityDisplayComponents/ContentBlocks/TextBlockEditor";

const StyledBlock = styled(Box)(({theme}) => ({
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


const ImageHeader = styled(CardHeader)(({theme}) => ({
    backgroundColor: theme.palette.background.contentBlockHeader,
    color: theme.palette.text.primary,

}));


const ImageHeaderIcon = styled(ImageIcon)(({theme}) => ({
    color: theme.palette.primary.dark,
    fontSize: '20px',
    marginRight: theme.spacing(1),

}));

const ImageCardContent = styled(CardMedia)(({theme}) => ({
    height: 'auto',
    maxHeight: 500,
    objectFit: 'contain',
    margin: theme.spacing(1),

}));

export default function ContentBlock({contentBlock, parentId, reloadParent}) {

    const [openEditor, setOpenEditor] = useState(false);
    // This has the state of the editor for the content block
    const [editorState, setEditorState] = useState("");

    const onClose = () => {
        setOpenEditor(false);
    };

    const onOpen = () => {
        setOpenEditor(true);
    };

    if (contentBlock && contentBlock.deleted === true) {
        return null;
    }

    const displayContent = contentBlock.content[contentBlock.content.length - 1];
    // Switch statement to determine which type of content block to render
    switch (contentBlock.block_type) {
        case 1:
            return (
                openEditor === true ? (
                    <TextBlockEditor parentId={parentId} initialContent={contentBlock.content[contentBlock.content.length - 1]}
                                     editorState={editorState} onEditorChange={setEditorState}
                                     onClose={onClose} reloadParent={reloadParent} contentBlockId={contentBlock.ID}/>
                ) : (

                    <StyledBlock onClick={onOpen}>
                        <ReactMarkdown>
                            {contentBlock.content[contentBlock.content.length - 1]}
                        </ReactMarkdown>
                    </StyledBlock>
                )
            );
        case 2:
            if (displayContent.length !== 2) {
                return (
                    <Typography>Image block is oddly formated, cannot display (Not the image but how it is stored in the dragon).</Typography>
                );
            }

            return (
                <Card>
                    <ImageHeader title={
                        <Box display="flex" alignItems="center">
                            <ImageHeaderIcon/>
                            <Typography variant="subtitle1">{displayContent[1]}</Typography>
                        </Box>
                    }/>

                    <ImageCardContent
                        component="img"
                        image={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${parentId}/${contentBlock.ID}`}
                    />
                </Card>
            )

        default:
            return (
              <Typography>Something went wrong with this content block</Typography>
            );
    }


}