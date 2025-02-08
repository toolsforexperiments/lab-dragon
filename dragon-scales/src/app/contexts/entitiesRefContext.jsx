"use client"

import { createContext, useRef, useState} from "react";

export const EntitiesRefContext = createContext();

export const EntitiesRefProvider = ({ children }) => {

    const [newCommentRequested, setNewCommentRequested] = useState(null);
    const [commentsIndex, setCommentsIndex] = useState({});

    const entitiesRef = useRef({});


    return (
        <EntitiesRefContext.Provider value={{ entitiesRef, commentsIndex, setCommentsIndex, newCommentRequested, setNewCommentRequested }}>
            {children}
        </EntitiesRefContext.Provider>
    );
};

