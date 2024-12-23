"use client"

import Lexical from "@/app/components/LexicalEditor/Lexical";
import { v4 as uuidv4 } from "uuid";

export default function TextBlockEditor({ onEditorChange, initialContent,  }) {

    const editorId = 'id_' + uuidv4();
    return (
        <Lexical autoFocus onChange={onEditorChange} initialContent={initialContent} editorId={editorId} />
    );


}





