"use client";

import React, { useRef } from "react";
import { SessionProvider } from "next-auth/react";
import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { makeStore, AppStore } from "../redux/store";
import { Toaster } from "react-hot-toast";

export default function AppProviders({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore>(undefined);
    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    return (
        <ReduxProvider store={storeRef.current}>
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