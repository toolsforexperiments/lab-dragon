import {useState} from "react";

import {
    Box, Button,
    Card,
    CardContent,
    CardHeader,
    CardMedia,
    Dialog, DialogActions, DialogContent,
    DialogTitle,
    IconButton,
    styled,
    Typography
} from "@mui/material";
import ReactMarkdown from 'react-markdown';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from "@mui/icons-material/Delete";
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

import TextBlockEditor from "@/app/components/EntityDisplayComponents/ContentBlocks/TextBlockEditor";
import ImageUploader from "@/app/components/EntityDisplayComponents/ContentBlocks/ImageBlockDrop";
import {deleteContentBlock} from "@/app/calls";
import Link from "next/link";


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
    '& .MuiButtonBase-root': {
        opacity: 0,
        transition: 'opacity 0.3s',
        marginRight: "10px",
        color: 'red',
    },
    '&:hover .MuiButtonBase-root': {
        opacity: 1,
    }

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
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const getFilePathDisplay = (path) => {
        const parts = path.split('/');
        return parts.length > 1 
            ? `${parts[parts.length - 2]}/${parts[parts.length - 1]}`
            : parts[parts.length - 1];
    }

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

    const onOpenDeleteDialog = (e) => {
        e.stopPropagation();
        setOpenDeleteDialog(true)
    }

    const onCloseDeleteDialog = () => {
        setOpenDeleteDialog(false)
    }

    const handleDeleteImage = (e) => {
        e.stopPropagation();
        onCloseDeleteDialog()
        deleteContentBlock(parentId, contentBlock.ID).then((res) => {
            if (res === true) {
                reloadParent();
            } else {
                console.error("Could not delete Image Block")
            }
        })
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
                            <Box display="flex" flexDirection="row" justifyContent="space-between">
                                <Box display="flex" alignItems="center">
                                    <ImageHeaderIcon/>
                                    <Typography variant="subtitle1"
                                                display="inline-block"
                                                sx={{cursor: 'text'}}
                                    >
                                        {displayContent[1]}
                                    </Typography>
                                </Box>
                                <IconButton onClick={onOpenDeleteDialog}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        }/>

                        <ImageCardContent
                            component="img"
                            // the `?t=${Date.now()}` is to stop nextjs from caching the image to allow for real time updates
                            image={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${parentId}/${contentBlock.ID}?t=${Date.now()}`}
                        />
                        <Dialog open={openDeleteDialog} onClick={(e) => e.stopPropagation()}>
                            <DialogTitle>Delete Entity</DialogTitle>
                            <DialogContent>
                                <Typography>
                                    Are you sure you want to delete "{displayContent[1]}"? This action cannot be undone without contacting the administrator.
                                </Typography>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={onCloseDeleteDialog}>Cancel</Button>
                                <Button onClick={handleDeleteImage} color="error">Delete</Button>
                            </DialogActions>
                        </Dialog>
                    </ImageCard>
                )
            )

        case 5:
            return (
                <Card>
                    <ImageHeader title={
                        <Box display="flex" flexDirection="row" justifyContent="space-between">
                            <Box display="flex" alignItems="center">
                                <LeaderboardIcon sx={{ color: "#0000008A", marginRight: 2}}/>
                                <ImageHeaderIcon/>
                                <Link href={`/instance/${displayContent[1]}`}>
                                    <Typography variant="subtitle1"
                                                display="inline-block"
                                                sx={{cursor: 'pointer', "&:hover": {textDecoration: "underline"}}}
                                    >
                                        {getFilePathDisplay(displayContent[0])}
                                    </Typography>
                                </Link>
                            </Box>
                            <IconButton onClick={onOpenDeleteDialog}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    }/>

                    <Link href={`/instance/${displayContent[1]}`}>
                        <ImageCardContent
                            component="img"
                            // the `?t=${Date.now()}` is to stop nextjs from caching the image to allow for real time updates
                            image={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/data/instance_image/${encodeURIComponent(displayContent[0].replace(/\//g, '#'))}`}
                        />
                    </Link>
                    
                    <Dialog open={openDeleteDialog} onClick={(e) => e.stopPropagation()}>
                        <DialogTitle>Delete Entity</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to delete "{displayContent[1]}"? This action cannot be undone without contacting the administrator.
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onCloseDeleteDialog}>Cancel</Button>
                            <Button onClick={handleDeleteImage} color="error">Delete</Button>
                        </DialogActions>
                    </Dialog>

                </Card>
            )

        default:
            return (
              <Typography>Something went wrong with this content block</Typography>
            );
    }


}