"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/state/appState";

import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { fetchUserSession } from "@/lib/auth";
import FeaturedBooks from "@/components/featuredBooks";
import Link from "next/link";
import { createOrder } from "@/lib/orders";

export default function Page() {
    const router = useRouter();
    const { isLoading, setIsLoading, cartData, currencySymbol, setCurrentUser } = useAppStore();
    const [contentClassOnScroll, setContentClassOnScroll] = useState<string>("");
    const [orderSaved, setOrderSaved] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const urlParams = new URLSearchParams(window.location.search);
        const paymentIntent = urlParams.get('payment_intent') ?? "";
        const paymentIntentSecret = urlParams.get('payment_intent_client_secret') ?? "";
        const paymentStatus = urlParams.get('redirect_status') ?? "";
        let cartItems: any;
        try {
            cartItems = JSON.parse(window.sessionStorage.getItem("cart_items") ?? "{}");
        } catch (err) {
            console.log(err);
        }

        const saveOrder = async () => {
            let currentUser = await fetchUserSession();
            setCurrentUser(currentUser);
            let orderData: any = {
                customer: currentUser?.id,
                customerEmail: currentUser?.email,
                orderTotal: cartItems.reduce((accumulator: number, currentValue: any) => accumulator + currentValue.amount, 0),
                currencySymbol: currencySymbol,
                items: cartItems.map((item: any) => ({
                    id: item.id,
                    isbn: item.isbn,
                    title: item.title,
                    qty: item.qty,
                    price: item.price,
                    amount: item.amount,
                })),
                paymentInfo: {
                    paymentIntent: paymentIntent,
                    paymentIntentSecret: paymentIntentSecret,
                    paymentStatus: paymentStatus
                },
                status: "CREATED"
            }

            const { results, error} = await createOrder(JSON.stringify(orderData));

            if (results != null) {
                setOrderSaved(true);
            } 
            setIsLoading(false);
        }

        if (paymentStatus == "succeeded" && orderSaved == false) {
            saveOrder();
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
            <div className="flex flex-col justify-between xl:container mt-[10px] mx-3 grow rounded-lg md:min-h-[800px] bg-card z-100 xl:mx-auto px-2 pb-10">
                <div className="flex flex-col flex-grow">
                    <div className="py-2 lg:py-5 text-xl lg:text-2xl font-bold">Order Checkout</div>
                    <Separator />
                    {isLoading ? (
                        <div className="flex flex-grow py-[100px] w-full justify-center items-center">
                            {isLoading && (
                                <Icons.spinner className="mr-2 h-10 w-10 animate-spin" />
                            )}
                            <div className="text-2xl">Finalizing your Order ...</div>
                        </div>
                    ) : (
                        <div className="flex flex-grow w-full justify-center items-center">
                            <div className="text-2xl">Order Confirmed!</div>
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
