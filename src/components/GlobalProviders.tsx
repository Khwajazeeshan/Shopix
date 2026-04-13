"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { store } from "../redux/store";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ReduxProvider store={store}>
            <SessionProvider>
                <NextThemesProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Toaster position="top-center" />
                    {children}
                </NextThemesProvider>
            </SessionProvider>
        </ReduxProvider>
    );
}
