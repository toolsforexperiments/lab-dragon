import { $getRoot, $getSelection } from 'lexical';
import { useEffect } from 'react';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS, } from '@lexical/markdown';
import {MarkdownShortcutPlugin} from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';



import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";


const LexicalBox = styled(Box)({
    position: "relative",
    width: "100%",
});

export const MuiContentEditable = styled(ContentEditable)(({ theme }) => ({
    minHeight: 100,
    width: "100%",
    // padding: "10px 8px",
    borderRadius: 5,
    paddingTop: 10,
    paddingLeft: 10,
    position: "relative",
    outline: "none",
    '&:focus': {
        outline: `2px solid ${theme.palette.primary.dark}`,
    },
    color: theme.palette.text.primary,
}));

export const PlaceHolderSx = styled("div")(({ theme }) => ({
    position: "absolute",
    top: "10px",
    left: "10px",
    userSelect: "none",
    pointerEvents: "none",
    color: theme.palette.text.light,
}));


function MyOnChangePlugin({ onChange }) {
    const [editor] = useLexicalComposerContext();
    
    useEffect(() => {
        return editor.registerUpdateListener(({editorState}) => {
            editorState.read(() => {
                const markdown = $convertToMarkdownString(TRANSFORMERS);
                console.log(markdown);
                onChange(markdown);
            });
        });
    }, [editor, onChange]);
    return null;
}


const theme = {
    // Theme styling goes here
    //...
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
    console.error(error);
}

export default function Lexical({ onChange, initialContent = '' }) {
    const initialConfig = {
        namespace: 'MyEditor',
        theme,
        onError,
        nodes: [
            HeadingNode,
            QuoteNode,
            CodeNode,
            ListNode,
            ListItemNode,
            LinkNode,
        ],
        editorState: () => {
            const root = $getRoot();
            if (initialContent) {
                $convertFromMarkdownString(initialContent, TRANSFORMERS);
            }
        },
    };

    return (
        <LexicalBox>
            <LexicalComposer initialConfig={initialConfig}>
                <RichTextPlugin
                    contentEditable={<MuiContentEditable />}
                    placeholder={<PlaceHolderSx>Start typing here...</PlaceHolderSx>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <AutoFocusPlugin />
                <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                <MyOnChangePlugin onChange={onChange}/>
            </LexicalComposer>
        </LexicalBox>
    );
}