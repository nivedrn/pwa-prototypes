"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/state/appState";
import StoreBanner from "@/components/storeBanner";
import Booktile from "@/components/booktile";
import { Icons } from "@/components/icons";
import { fetchBooks, fetchGroupedBooks } from '@/lib/books';
import Link from "next/link";
import { fetchUserSession } from "@/lib/auth";

export default function Home() {
    const { isLoading, setIsLoading } = useAppStore();
    const [data, setData] = useState<any>(null);
    const [groupedData, setGroupedData] = useState<any>(null);
    const [contentClassOnScroll, setContentClassOnScroll] = useState<string>("");

    useEffect(() => {
        setIsLoading(true);
               
        const fetchData = async () => {
            const { results, error } = await fetchBooks(14);

            if (results != null) {
                console.log("Results: ", results);
                setData(results);
                setIsLoading(false);
            } else {
                console.log("Error: ", error);
            }
        }

        fetchData();

        setIsLoading(true);
        const fetchGroupedData = async () => {
            const { results, error } = await fetchGroupedBooks();

            if (results != null) {
                console.log("Results: ", results);
                setGroupedData(results);
                setIsLoading(false);
            } else {
                console.log("Error: ", error);
            }
        }

        fetchGroupedData();

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
                <div className="flex w-full px-10 md:pt-5 justify-between">
                    <strong>Featured Books</strong>
                    <Link href="/books" className="hover:underline hover:text-bold">View all books<Icons.arrowRight className="inline ml-2 h-4 w-4" /></Link>
                </div>
                <div className="flex justify-center">
                    {data != null && (
                        <div className="flex flex-wrap gap-2 md:pt-2 justify-center">
                            {data.map((item: any, index: number) => (
                                <Booktile key={index} book={item} mode={isLoading ? "skeleton" : "book"} />
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-start px-5 md:px-10 mb-[15px] ">
                    {groupedData != null && (
                        <div className="flex flex-col gap-5 md:pt-5 justify-start overflow-x-auto">
                            {groupedData.map((item: any, index: number) => (
                                <div key={index} className="flex flex-col w-full gap-2">
                                    <div className="flex w-full md:pt-5 justify-between">
                                        <span><strong>{item.category}</strong>&nbsp;books</span>
                                        <Link href={`/books?category=${item.category}`} className="hover:underline hover:text-bold">View more<Icons.arrowRight className="inline ml-2 h-4 w-4" /></Link>
                                    </div>
                                    <div className="w-full flex flex-row gap-2">
                                        {item.books.map((item: any, index: number) => (
                                            <Booktile key={index} book={item} mode={isLoading ? "skeleton" : "book"} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
