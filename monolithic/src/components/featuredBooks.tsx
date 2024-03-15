"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/state/appState";
import Booktile from "@/components/booktile";
import { fetchBooks } from '@/lib/books';

export default function FeaturedBooks() {
    const { isLoading, setIsLoading } = useAppStore();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        setIsLoading(true);

        const fetchData = async () => {
            const offset = Math.floor(Math.random() * 200)
            const { results, error } = await fetchBooks(14, offset);

            if (results != null) {
                setData(results);
                setIsLoading(false);
            } else {
                console.log("Error: ", error);
            }
        }

        fetchData();

    }, []);

    return (
        <>
            <div className="flex justify-center">
                {data != null && (
                    <div className="flex flex-wrap gap-2 md:pt-2 justify-center">
                        {data.map((item: any, index: number) => (
                            <Booktile key={index} book={item} mode={isLoading ? "skeleton" : "book"} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
