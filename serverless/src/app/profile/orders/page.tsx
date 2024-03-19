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
import { fetchOrders } from "@/lib/orders";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Page() {
    const router = useRouter();
    const { isLoading, setIsLoading, currencySymbol, currentUser } = useAppStore();
    const [contentClassOnScroll, setContentClassOnScroll] = useState<string>("");
    const [data, setData] = useState<any>([]);
    const [hasMoreResults, setHasMoreResults] = useState<boolean>(true);

    const fetchData = async (limit: number, offset: number) => {
        const { results, error } = await fetchOrders(true, currentUser?.id, limit, offset);
        if (results != null) {
            console.log("Results: ", results);
            if (data.length < 1) {
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

    const fetchMoreBooks = () => {
        setIsLoading(true);
        fetchData(10, data.length);
    }

    useEffect(() => {
        fetchData(10, 0);
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
                <div className="py-2 lg:py-5 text-xl lg:text-2xl font-bold">My Orders</div>
                <Separator />
                <div className="flex">
                    {data != null && (
                        <div className="flex flex-col flex-wrap gap-2 md:pt-5 w-full justify-center">
                            {data.map((item: any, index: number) => (
                                <>
                                    <Card className="flex flex-col min-h-[200px] my-2">
                                        <CardHeader className="flex flex-row justify-between w-full py-2">
                                            <p>Order Id: {item.id}</p>
                                            <p>Status: {item.status}</p>
                                            <p>Total: {item.currencySymbol} {item.orderTotal}</p>
                                        </CardHeader>
                                        <CardContent className="flex grow w-full">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Item</TableHead>
                                                        <TableHead className="w-[50px]">Qty</TableHead>
                                                        <TableHead className="w-[120px]">Price (in {currencySymbol})</TableHead>
                                                        <TableHead className="w-[140px] text-right">Amount (in {currencySymbol})</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {item.items.map((item: any, index: number) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="font-large"><Link href={`/books/${item.isbn}`} className="hover:underline">{item.title}</Link></TableCell>
                                                            <TableCell>{item.qty}</TableCell>
                                                            <TableCell>{item.price.toFixed(2)}</TableCell>
                                                            <TableCell className="text-right">{item.amount.toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                </>
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
                        <div>No more orders to show.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
