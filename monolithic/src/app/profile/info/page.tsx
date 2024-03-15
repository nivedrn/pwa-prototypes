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

export default function Page() {
    const { isLoading, setIsLoading, currentUser } = useAppStore();
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
                <div className="py-2 lg:py-5 text-xl lg:text-2xl font-bold">My Profile</div>
                <Separator />
                <Card className="flex flex-col mt-2 mb-10">
                    <CardContent className="flex flex-col md:flex-row grow w-full py-0">
                        <div className="py-5">
                            <Icons.profile className="mx-auto h-16 w-16 opacity-25 group-hover:opacity-25" />
                        </div>
                        <div className="flex flex-col p-5 justify-center">
                            <div className="text-2xl font-bold">{currentUser?.name}</div>
                            <div className="text-xl">{currentUser?.email}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
