"use client"

import { createTheme, ThemeProvider } from "@mui/material";


export const theme = createTheme({
    palette: {
        primary: {
            lighter: '#10B98129',
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
        },
        text: {
            secondary: '#94A3B8'
        }
    },
    typography: {
        h1: {
            fontWeight: 300,
            fontSize: '96px',
            lineHeight: '112.03px',
            letterSpacing: "-1.5px",
        },
        h2: {
            fontWeight: 300,
            fontSize: '60px',
            lineHeight: '72px',
            letterSpacing: "-0.5px",
        },
        h3: {
            fontWeight: 400,
            fontSize: '48px',
            lineHeight: '56.02px',
        },
        h4: {
            fontWeight: 400,
            fontSize: '34px',
            lineHeight: '41.99px',
            letterSpacing: "0.25px",
        },
        h5: {
            fontWeight: 500,
            fontSize: '24px',
            lineHeight: '32.02px',
            letterSpacing: "1px",
        },
        h6: {
            fontWeight: 500,
            fontSize: '20px',
            lineHeight: '32px',
            letterSpacing: "0.2px",
        },
        body1: {
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: "0.15px",
        },
        body2: {
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20.02px',
            letterSpacing: "0.17px",
        },
        subtitle1: {
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '28px',
            letterSpacing: "0.15px",
        },
        subtitle2: {
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '21.98px',
            letterSpacing: "0.1px",
        },
        caption: {
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '19.92px',
            letterSpacing: "0.4px",
        },
        overline: {
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '31.92px',
            letterSpacing: "1px",
        },
    }

})

export default function LDThemeProvider({children}) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}



