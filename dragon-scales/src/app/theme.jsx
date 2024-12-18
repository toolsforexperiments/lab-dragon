"use client"

import { createTheme, ThemeProvider } from "@mui/material";


export const theme = createTheme({
    palette: {
        primary: {
            light: '#A7F3D0',
            main: '#10B981',
            dark: '#059669',
            darker: '#065F46',
            contrast: '#FFFFFF',
        },
        secondary: {
            light: '#E2E8F0',
            main: '#64748B',
            dark: '#475569',
            darker: '#334155',
            contrast: '#FFFFFF',
        },
        background: {
            default: '#FFFFFF',
            paper: '#F9FAFB',
            notebookAccordion: '#F3F4F6',
            notebookAccordionDarker: '#cccccc'
        },
        entities: {
            background: {
                Project: '#10B981',
                Task: '#10B98129',
                Step: '#10B9810A',
            },
            chip: {
                Project: '#FFFFFFF2',
                Task: '#065F46',
                Step: '#065F46',

            },
            text: {
                Project: '#FFFFFF',
                Task: '#334155',
                Step: '#000000'
            }
        
        }
    },

})

export default function LDThemeProvider({children}) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}



