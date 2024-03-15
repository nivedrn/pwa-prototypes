"use client"
import { useEffect, useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { StripePaymentElementOptions } from "@stripe/stripe-js";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { toast } from "sonner";

export default function PaymentForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    toast("Payment succeeded!");
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    toast("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    toast("Your payment was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
                    toast("Something went wrong.");
                    break;
            }
        });
    }, [stripe]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: "http://localhost:5000/checkout/result",
            },
        });

        console.log(error);
        // // This point will only be reached if there is an immediate error when
        // // confirming the payment. Otherwise, your customer will be redirected to
        // // your `return_url`. For some payment methods like iDEAL, your customer will
        // // be redirected to an intermediate site first to authorize the payment, then
        // // redirected to the `return_url`.
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message ?? "");
            toast(error.message);
        } else {
            setMessage("An unexpected error occurred.");
            toast("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    const paymentElementOptions: StripePaymentElementOptions = {
        layout: {
            type: 'accordion',
            defaultCollapsed: false,
            radios: true,
            spacedAccordionItems: false
          }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" options={paymentElementOptions} />
            <button disabled={isLoading || !stripe || !elements} id="submit" className={cn(buttonVariants(), "w-full mt-5")} >
                Pay Now
                {isLoading ? (
                    <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                )}
            </button>
            {/* Show any error or success messages */}
            {message && <div id="payment-message">{message}</div>}
        </form>
    );
}