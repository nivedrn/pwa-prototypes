"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/state/appState";
import Booktile from "@/components/booktile";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons";
import { fetchBooks } from '@/lib/books';
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();
    const { isLoading, setIsLoading } = useAppStore();
    const [data, setData] = useState<any>([]);
    const [listTitle, setListTitle] = useState<string>("Showing all books");
    const [hasMoreResults, setHasMoreResults] = useState<boolean>(true);
    const [contentClassOnScroll, setContentClassOnScroll] = useState<string>("");

    const getQueryParam = (name: string): string => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name) || "";
    };

    const fetchData = async (limit: number, offset: number, featured: boolean, category: string, search: string, reset: boolean = false) => {
        const { results, error } = await fetchBooks(limit, offset, featured, category, search);
        if (results != null) {
            console.log("Results: ", results);
            if (reset) {
                setData(results);
            } else {
                setData([...data, ...results]);
            }
            if (results.length == 0) {
                setHasMoreResults(false);
            } else {
                setHasMoreResults(true);
            }
            setIsLoading(false);
        } else {
            console.log("Error: ", error);
        }
    }

    const clearFilters = () => {
        setIsLoading(true);
        setListTitle("Showing all books");
        router.replace("/books");
        fetchData(42, 0, false, "", "", true);
    }

    const fetchMoreBooks = () => {
        setIsLoading(true);
        let category = getQueryParam('category');
        let search = getQueryParam('search');
        fetchData(42, data.length, false, category, search);
    }

    useEffect(() => {
        setIsLoading(true);
        let category = getQueryParam('category');
        let search = getQueryParam('search');
        if (getQueryParam('category') != "") {
            setListTitle("Showing books under category: " + category);
        }
        if (getQueryParam('search') != "") {
            setListTitle("Showing search results for term: " + search);
        }
        fetchData(42, 0, false, getQueryParam('category'), getQueryParam('search'));

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
            <div className="container mt-[5px] mb-[15px] mx-auto grow rounded-lg bg-card p-2">
                <div className="flex w-full px-10 md:pt-5 justify-between">
                    <strong className="flex items-center">{listTitle}</strong>
                    { listTitle != "Showing all books"  && (<Button variant="secondary" className="hover:text-bold" onClick={clearFilters} >Clear Filters<Icons.cross className="inline ml-2 h-4 w-4" /></Button>)}
                </div>
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
                    {hasMoreResults ? (
                        <button className={cn(buttonVariants(), "")} disabled={isLoading} onClick={fetchMoreBooks}>
                            {isLoading && (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Show More
                        </button>) : (
                        <div>No more results to show.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
