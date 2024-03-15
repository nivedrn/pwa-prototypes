"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore, ShoppingCartItem } from "@/state/appState";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
    book: any;
    mode: string;
}

export default function Booktile(props: Props) {
    const { cartData, setCartData, currencySymbol } = useAppStore();
    const [book] = useState<any | null>(props.book);
    const [mode] = useState<any | null>(props.mode);

    const addToCart = () => {
        const existingItemIndex = cartData.findIndex(item => item.isbn === book.isbn);

        if (existingItemIndex !== -1) {
            const updatedCartData = [...cartData];
            updatedCartData[existingItemIndex].qty += 1;
            updatedCartData[existingItemIndex].amount = updatedCartData[existingItemIndex].qty * updatedCartData[existingItemIndex].price;
            setCartData(updatedCartData);
            toast("Updated cart item.");
        } else {
            const newItem = new ShoppingCartItem(
                book.id,
                book.isbn,
                book.title,
                1,
                book.price
            );
            setCartData([...cartData, newItem]);
            toast("Added book to cart.");
        }
    }

    return (
        <>
            {(mode == "book" ? (
                <>{(book != null && (
                    <div className="flex flex-col w-[180px] h-[255px] md:w-[180px] md:h-[340px] border rounded-lg bg-card shadow">
                        <Link href={`/book/${book.isbn}`}>
                            <div className="flex justify-center items-center">
                                <Image
                                    src={book.thumbnail_url}
                                    alt={book.title}
                                    width="200"
                                    height="200"
                                    className="rounded-lg w-[120px] h-[160px] md:w-[180px] md:h-[240px]"
                                />
                            </div>
                            <Separator />
                            <p className="p-2 line-clamp-2 text-sm font-semibold h-[60px]">{book.title}</p>
                        </Link>
                        <div className="flex w-full justify-between items-center px-2">
                            <div className="text-sm">{currencySymbol} {book.price ? book.price : 15.00 }</div>
                            <Button variant="default" onClick={addToCart} className="p-0 h-[25px] w-[35px] shadow" >
                                <Icons.cart className="h-4 w-4 opacity-85" />
                            </Button>
                        </div>
                    </div>
                ))}</>
            ) : (
                <><Skeleton className="w-[180px] h-[240px] md:w-[180px] md:h-[340px]" /></>
            ))}
        </>
    );
}
