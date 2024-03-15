"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/state/appState";
import Booktile from "@/components/booktile";

export default function FeaturedBooks() {
    const { isLoading, setIsLoading } = useAppStore();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        setIsLoading(true);
        const offset = Math.floor(Math.random() * 200)
        let query = "/api/products/list?limit=14&offset=" + offset;
        fetch(query)
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
