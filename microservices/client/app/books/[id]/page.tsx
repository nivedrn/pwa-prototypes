"use client";
import { useEffect, useState } from "react";
import { useAppStore, ShoppingCartItem } from "@/state/appState";
import { Button, buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import FeaturedBooks from "@/components/featuredBooks";
import Link from "next/link";
import ImageWithFallback from "@/components/imageWithFallback";

export default function Page({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { cartData, setCartData, currencySymbol } = useAppStore();
    const { isLoading, setIsLoading } = useAppStore();
    const [data, setData] = useState<any>([]);
    const [contentClassOnScroll, setContentClassOnScroll] = useState<string>("");

    const fetchData = async (bookId: string) => {
        console.log("BookId: ", bookId);
        fetch("/api/products/item/"+bookId)
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
    }

    const addToCart = () => {
        const existingItemIndex = cartData.findIndex(item => item.isbn === data.isbn);

        if (existingItemIndex !== -1) {
            const updatedCartData = [...cartData];
            updatedCartData[existingItemIndex].qty += 1;
            updatedCartData[existingItemIndex].amount = updatedCartData[existingItemIndex].qty * updatedCartData[existingItemIndex].price;
            setCartData(updatedCartData);
            toast("Updated cart item.");
        } else {
            const newItem = new ShoppingCartItem(
                data.id,
                data.isbn,
                data.title,
                1,
                data.price
            );
            setCartData([...cartData, newItem]);
            toast("Added book to cart.");
        }
    }

    useEffect(() => {
        setIsLoading(true);
        if(params.id == "undefined"){
            router.push("/books");
        }else if (params.id != undefined && params.id != null && params.id != "") {
            fetchData(params.id);
        }

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
            <div className="flex flex-col justify-between xl:container mt-[5px] mb-[15px] mx-auto grow rounded-lg bg-card p-2 pb-10">
                {isLoading || data == null ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <div className="flex flex-col">
                        <div className="flex flex-col md:flex-row justify-center pb-6">
                            <div className="flex min-w-[400px] px-10 md:pt-5 justify-center">
                                <ImageWithFallback
                                    src={data.thumbnail_url ?? "../public/next.svg"}
                                    alt={data.title}
                                    width="200"
                                    height="200"
                                    className="rounded-lg w-[240px] h-[320px] md:w-[400px] md:h-[420px]"
                                />
                            </div>
                            <div className="flex flex-col grow-1 w-full px-5 md:px-10 md:pt-5 justify-between">
                                <div className="flex flex-col gap-2">
                                    <strong className="flex items-center text-xl md:text-2xl">{data.title}</strong>
                                    <p className="flex items-center text-justify">{data.short_description}</p>
                                    <p className="flex items-center text-justify">Page Count : {data.page_count}</p>
                                    <div>
                                        <strong className="flex items-center">Authors : </strong>
                                        <div className="text-lg">{data.authors?.join(", ")}</div>
                                    </div>
                                    <div>
                                        <strong className="flex items-center">ISBN : </strong>
                                        <div className="text-lg">{data.isbn}</div>
                                    </div>
                                    <div>
                                        <strong className="flex items-center">Price : </strong>
                                        <strong className="text-2xl">{currencySymbol} {data.price}</strong>
                                    </div>
                                </div>
                                <div className="flex w-full gap-5 align-end">
                                    <Button variant="secondary" onClick={addToCart} className="flex grow p-0 h-[45px] shadow hover:bg-orange-200" >
                                        <Icons.wishlist className="h-4 w-4 opacity-85" />&nbsp;Save to Wishlist
                                    </Button>
                                    <Button variant="default" onClick={addToCart} className="flex grow  h-[45px] shadow" >
                                        <Icons.cart className="h-4 w-4 opacity-85" />&nbsp;Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex flex-col w-full px-10 md:py-5 justify-between">
                            <strong className="flex items-center py-2 ">Summary</strong>
                            <p className="flex items-center text-justify">{data.long_description}</p>
                        </div>
                    </div>
                )}
                <div>
                    <Separator />
                    <div className="flex w-full px-5 md:pt-10 justify-between">
                        <span>Check out some other similar books, </span>
                        <Link href="/books" className="hover:underline hover:text-bold">View all books<Icons.arrowRight className="inline ml-2 h-4 w-4" /></Link>
                    </div>
                    <FeaturedBooks />
                </div>
            </div>
        </div>
    );
}
