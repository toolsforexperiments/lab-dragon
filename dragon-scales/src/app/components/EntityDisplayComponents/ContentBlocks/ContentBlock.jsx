import {Box, styled} from "@mui/material";
import ReactMarkdown from 'react-markdown';
import {useState} from "react";
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
}