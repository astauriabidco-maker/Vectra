import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import RealTimeListener from "@/components/RealTimeListener";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body
                    className={cn(
                        "min-h-screen bg-background font-sans antialiased",
                        inter.variable
                    )}
                >
                    <RealTimeListener />
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}
