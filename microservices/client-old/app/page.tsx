"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/state/appState";
import StoreBanner from "@/components/storeBanner";
import Booktile from "@/components/booktile";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons";

export default function Home() {
    const {isLoading, setIsLoading} = useAppStore();
    const [data, setData] = useState<any>(null);
    const [contentClassOnScroll, setContentClassOnScroll] = useState<string>("");

    useEffect(() => {
        setIsLoading(true);
        fetch("/api/products/list?limit=16")
            .then((res) => {
                if (!res.ok) {
                    throw new Error(res.statusText); // Handle errors
                }
                return res.json(); // Parse JSON response
            })
            .then((res) => {
                if (res.data) {
                    setData(res.data);
                    console.log(res);
                }
                console.log(res);
                setIsLoading(false);
            })
            .catch((err: string) => {
                console.error(err)
            });

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
            <StoreBanner />
            <div className="container mt-[5px] mb-[15px] mx-auto grow rounded-lg bg-card p-2">
                <div className="flex justify-center">
                    {data != null && (
                        <div className="flex flex-wrap gap-2 md:pt-5 justify-center">
                            {data.map((item: any, index: number) => (
                                <Booktile key={index} book={item} mode={ isLoading ? "skeleton" : "book"} />
                            ))}
                        </div>
                    )}
                </div>
                <div className="w-full min-h-[50px] my-5 flex justify-center items-center">
                    <button className={cn(buttonVariants(),"")} disabled={isLoading}>
                        {isLoading && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Show More
                    </button>
                </div>
            </div>
        </div>
    );
}
