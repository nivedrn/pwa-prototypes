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
import Link from "next/link";
import FeaturedBooks from "@/components/featuredBooks";

export default function Home() {
    const { isLoading, setIsLoading, cartData, currencySymbol, currentUser } = useAppStore();
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
            <div className="flex flex-col justify-between xl:container mt-[10px] mx-3 grow rounded-lg md:min-h-[800px] bg-card z-100 xl:mx-auto px-2 pb-10">
                <div>
                    <div className="py-2 lg:py-5 text-xl lg:text-2xl font-bold">Shopping Cart</div>
                    <Separator />
                    {cartData && cartData.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4 ">
                            <div className="col-span-3 md:col-span-2 m-5">
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
                                        {cartData.map((item: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-large"><Link href={`/books/${item.isbn}`} className="hover:underline">{item.title}</Link></TableCell>
                                                <TableCell>{item.qty}</TableCell>
                                                <TableCell>{item.price.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">{item.amount.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="col-span-3 md:col-span-1 flex flex-col items-center">
                                <Card className="w-full my-5 bg-slate-50">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Subtotal ({cartData.length} {cartData.length > 1 ? "items" : "item"}):&nbsp;&nbsp;
                                            {currencySymbol}&nbsp;
                                            {cartData.reduce(
                                                (accumulator, currentValue) => accumulator + currentValue.amount,
                                                0,
                                            ).toFixed(2)}</CardTitle>
                                        <CardDescription>Addtional charges may incur for shipping and taxes. Proceed to checkout to view details.</CardDescription>
                                    </CardHeader>
                                    <CardFooter>
                                        <Link href="/checkout"
                                            className={cn(
                                                buttonVariants({ variant: "default" }),
                                                "px-2 w-full"
                                            )}
                                        >
                                            Checkout
                                            {isLoading ? (
                                                <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Icons.arrowRight className="ml-2 h-4 w-4" />
                                            )}
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-grow flex-col justify-between">
                            <div className="flex w-full justify-center py-20">No items added to cart.</div>
                        </div>
                    )}
                </div>
                <div>
                    <Separator />
                    <div className="flex w-full px-5 md:pt-5 justify-between">
                        <span>Check out some of our other featured books, </span>
                        <Link href="/books" className="hover:underline hover:text-bold">View all books<Icons.arrowRight className="inline ml-2 h-4 w-4" /></Link>
                    </div>
                    <FeaturedBooks />
                </div>
            </div>
        </div>
    );
}
