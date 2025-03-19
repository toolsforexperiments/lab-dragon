"use client"

import { createContext, useRef, useState} from "react";

export const EntitiesRefContext = createContext();

export const EntitiesRefProvider = ({ children }) => {

    const [newCommentRequested, setNewCommentRequested] = useState(null);
    const [commentsIndex, setCommentsIndex] = useState({});
    const [entitiesRef, setEntitiesRef] = useState({});


    return (
        <EntitiesRefContext.Provider value={{ entitiesRef, setEntitiesRef, commentsIndex, setCommentsIndex, newCommentRequested, setNewCommentRequested }}>
            {children}
        </EntitiesRefContext.Provider>
    );
};

