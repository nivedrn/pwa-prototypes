"use client";
import { useEffect, useState } from "react";
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

import { Appearance, StripeElementsOptions, loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "@/components/paymentForm";
import FeaturedBooks from "@/components/featuredBooks";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Page() {
    const { cartData, currencySymbol } = useAppStore();
    const [contentClassOnScroll, setContentClassOnScroll] = useState<string>("");
    const [clientSecret, setClientSecret] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);

    const calculateTotalAmount = () => {
        return cartData.reduce((accumulator, currentValue) => accumulator + currentValue.amount, 0);
    };

    useEffect(() => {
        setTotalAmount(calculateTotalAmount());
        initiateCheckout(calculateTotalAmount());
        const handleScroll = () => {
            if (typeof window !== "undefined" && window.scrollY > 1 && window.scrollY < 50) {
                setContentClassOnScroll("mt-[" + window.scrollY + "px]");
            } else {
                setContentClassOnScroll("");
            }
        };

        window.sessionStorage.setItem("cart_items", JSON.stringify(cartData))

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const initiateCheckout = async (amount: number) => {        
        const response = await fetch("/api/payment/createpaymentintent", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: calculateTotalAmount() })
        });
    
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
    
        const data = await response.json();
        setClientSecret(data.client_secret ?? "");
        console.log(data);
    }

    const appearance: Appearance = {
        theme: 'stripe',
    };

    const options: StripeElementsOptions = {
        clientSecret,
        appearance,
    };

    return (
        <div className={`flex flex-col ${contentClassOnScroll} grow`}>
            <div className="xl:container mt-[10px] mx-3 grow rounded-lg md:min-h-[800px] bg-card z-100 xl:mx-auto px-2">
                <div className="py-2 lg:py-5 text-xl lg:text-2xl font-bold">Order Checkout</div>
                <Separator />

                {cartData && cartData.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 ">
                        <div className="col-span-2 md:col-span-3 m-5">
                            {clientSecret && (
                                <Elements options={options} stripe={stripePromise}>
                                    <PaymentForm />
                                </Elements>
                            )}
                        </div>
                        <div className="col-span-2 md:col-span-2 flex flex-col items-center">
                            <Card className="w-full my-5 bg-slate-50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xl">
                                        Order Summary&nbsp;({cartData.length} {cartData.length > 1 ? "items" : "item"}):&nbsp;
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <Table>
                                        <TableCaption>
                                            <Separator />
                                        </TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Item</TableHead>
                                                <TableHead className="w-[140px] text-right">Amount (in {currencySymbol})</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {cartData.map((item: any, index: number) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-large">
                                                        <div className="font-bold">{item.title}</div>
                                                        <div className="">{item.qty} x {currencySymbol}{item.price.toFixed(2)}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right">{item.amount.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter>
                                    <div className="w-full flex justify-between">
                                        <div className="inline text-xl font-bold">Total</div>
                                        <div className="inline text-xl font-bold">{currencySymbol}&nbsp;{totalAmount.toFixed(2)}</div>
                                    </div>

                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex w-full justify-center py-12">No items added to cart.</div>
                        <FeaturedBooks/>
                    </>
                )}
            </div>
        </div>
    );
}
