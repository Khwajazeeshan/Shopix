import type { Metadata } from "next";
import "./globals.css";
import Chatbot from "../components/Chatbot";
import CookieConsent from "../components/Cookies/CookieConsent";
import AppProviders from "./AppProviders";

export const metadata: Metadata = {
  title: "Shopix- E-commerce platform",
  description: "Shopix is a e-commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>
          {children}
          <Chatbot />
          <CookieConsent />
        </AppProviders>
      </body>
    </html>
  );
}
