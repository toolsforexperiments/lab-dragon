import {useState} from "react";

import {Box, Card, CardContent, CardHeader, CardMedia, styled, Typography} from "@mui/material";
import ReactMarkdown from 'react-markdown';
import ImageIcon from '@mui/icons-material/Image';

import TextBlockEditor from "@/app/components/EntityDisplayComponents/ContentBlocks/TextBlockEditor";
import ImageUploader from "@/app/components/EntityDisplayComponents/ContentBlocks/ImageBlockDrop";

const StyledBlock = styled(Box)(({theme}) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',

    '&:hover': {
        backgroundColor: theme.palette.primary.lighter,
    },

    // Style markdown content
    '& p': {
        margin: 0,
        ...theme.typography.body1,
        cursor: 'text',
        display: 'inline-block',
    }
}));


const ImageCard = styled(Card)(({theme}) => ({

    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.primary.lighter,
    },

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

    const [openTextEditor, setOpenTextEditor] = useState(false);
    // This has the state of the editor for the content block
    const [textEditorState, setTextEditorState] = useState("");
    const [openImageEditor, setOpenImageEditor] = useState(false);


    const onCloseTextEditor = () => {
        setOpenTextEditor(false);
    };

    const onOpenTextEditor = () => {
        setOpenTextEditor(true);
    };

    const onCloseImageEditor = () => {
        setOpenImageEditor(false);
    }

    const onOpenImageEditor = () => {
        setOpenImageEditor(true);
    }

    if (contentBlock && contentBlock.deleted === true) {
        return null;
    }

    const displayContent = contentBlock.content[contentBlock.content.length - 1];
    // Switch statement to determine which type of content block to render
    switch (contentBlock.block_type) {
        case 1:
            return (
                openTextEditor === true ? (
                    <TextBlockEditor parentId={parentId} initialContent={contentBlock.content[contentBlock.content.length - 1]}
                                     editorState={textEditorState} onEditorChange={setTextEditorState}
                                     onClose={onCloseTextEditor} reloadParent={reloadParent} contentBlockId={contentBlock.ID}/>
                ) : (

                    <StyledBlock onClick={onOpenTextEditor}>
                        <ReactMarkdown>
                            {contentBlock.content[contentBlock.content.length - 1]}
                        </ReactMarkdown>
                    </StyledBlock>
                )
            );
        case 2:
            if (displayContent.length !== 2) {
                return (
                    <Typography>Image block is oddly formatted, cannot display (Not the image but how it is stored in the dragon).</Typography>
                );
            }

            return (
                openImageEditor ? (
                    <ImageUploader parentId={parentId} reloadParent={reloadParent} handleOnClose={onCloseImageEditor} contentBlock={contentBlock}/>
                ) : (
                    <ImageCard onClick={onOpenImageEditor}>
                        <ImageHeader title={
                            <Box display="flex" alignItems="center">
                                <ImageHeaderIcon/>
                                <Typography variant="subtitle1"
                                            display="inline-block"
                                            sx={{cursor: 'text'}}
                                >
                                    {displayContent[1]}
                                </Typography>
                            </Box>
                        }/>

                        <ImageCardContent
                            component="img"
                            // the `?t=${Date.now()}` is to stop nextjs from caching the image to allow for real time updates
                            image={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${parentId}/${contentBlock.ID}?t=${Date.now()}`}
                        />
                    </ImageCard>
                )
            )

        default:
            return (
              <Typography>Something went wrong with this content block</Typography>
            );
    }


}