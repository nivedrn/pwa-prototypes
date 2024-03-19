"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/appState";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default function Home() {
    const { isLoading, setIsLoading, cartData, currencySymbol } = useAppStore();
    const [contentClassOnScroll, setContentClassOnScroll] = useState<string>("");

    useEffect(() => {

        const handleScroll = () => {
            if (typeof window !== "undefined" && window.scrollY > 1 && window.scrollY < 50) {
                setContentClassOnScroll("mt-[" + window.scrollY + "px]");
            } else {
                setContentClassOnScroll("");
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={`flex flex-col ${contentClassOnScroll} grow`}>
            <div className="xl:container mt-[10px] mx-3 grow rounded-lg md:min-h-[800px] bg-card z-100 xl:mx-auto px-2">
                <div className="py-2 lg:py-5 text-xl lg:text-2xl font-bold">My Wishlist</div>
                <Separator />
            </div>
        </div>
    );
}
