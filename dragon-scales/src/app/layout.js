import localFont from "next/font/local";
import { Box } from "@mui/material";

import "./globals.css";
import Toolbar from "./components/Toolbar";
import { ExplorerProvider } from "@/app/contexts/explorerContext";
import { UserProvider } from "@/app/contexts/userContext";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata = {
    title: "Lab Dragon",
    description: "The Lab Dragon App",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <UserProvider>
                    <ExplorerProvider>
                        <Box sx={{ display: "flex", height: "100vh" }}>
                            <Toolbar />
                            <Box sx={{ flexGrow: 1, overflow: "auto", pl: "64px" }}>
                                {children}
                            </Box>
                        </Box>
                    </ExplorerProvider>
                </UserProvider>
            </body>
        </html>
    );
}
