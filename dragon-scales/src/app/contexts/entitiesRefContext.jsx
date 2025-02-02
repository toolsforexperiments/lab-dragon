"use client"

import { createContext, useRef, } from "react";

export const EntitiesRefContext = createContext();

export const EntitiesRefProvider = ({ children }) => {
    const entitiesRef = useRef({});

    return (
        <EntitiesRefContext.Provider value={{ entitiesRef }}>
            {children}
        </EntitiesRefContext.Provider>
    );
};

