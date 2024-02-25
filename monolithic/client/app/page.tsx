"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/state/appState";
import StoreBanner from "@/components/storeBanner";
import Booktile from "@/components/booktile";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons";
import { fetchBooks } from '@/app/actions';

export default function Home() {
    const { isLoading, setIsLoading } = useAppStore();
    const [data, setData] = useState<any>(null);
    const [contentClassOnScroll, setContentClassOnScroll] = useState<string>("");

    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            const { results, error } = await fetchBooks(16);
            
            if(results != null){
                console.log("Results: ", results);
                setData(results);
            }else{
                console.log("Error: ", error);
            }
        }

        fetchData();

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
                                <Booktile key={index} book={item} mode={isLoading ? "skeleton" : "book"} />
                            ))}
                        </div>
                    )}
                </div>
                <div className="w-full min-h-[50px] my-5 flex justify-center items-center">
                    <button className={cn(buttonVariants(), "")} disabled={isLoading}>
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
