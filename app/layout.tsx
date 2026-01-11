import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Step Tracker Betting",
    description: "Aaron vs Andrew Step Tracker",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Step Tracker",
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: "#f8fafc",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
                {children}
            </body>
        </html>
    );
}
