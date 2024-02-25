import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "The Bookstore",
    description: "The bookstore built on Microservices",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-orange-50 h-screen`}>
                <div className="flex flex-col h-full ">
                    <div className="flex flex-col flex-1">
                        <Navbar mode="public" />
                        {children}
                        <Footer />
                    </div>
                </div>
                <Toaster />
            </body>
        </html>
    );
}
