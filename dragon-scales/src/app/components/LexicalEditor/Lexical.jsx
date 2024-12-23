import {$getRoot } from 'lexical';
import { useEffect } from 'react';

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
                onChange(markdown);
            });
        });
    }, [editor, onChange]);
    return null;
}


export function AutoFocusPlugin({defaultSelection="rootStart"}) {
    // I have no clue why or how this works, but it does.
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.focus();
        
        const rootElement = editor.getRootElement();
        if (rootElement !== null && document.activeElement !== rootElement) {
            setTimeout(() => {
                rootElement.focus({preventScroll: true});
            }, 30);
        }
    }, [defaultSelection, editor]);
  
    return null;
}

const theme = {
    // Theme styling goes here
    //...
}
function onError(error) {
    console.error(error);
}

export default function Lexical({ onChange, initialContent = '', editorId }) {
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
            <LexicalComposer id={editorId} initialConfig={initialConfig}>
                
                <RichTextPlugin
                    id={editorId}
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