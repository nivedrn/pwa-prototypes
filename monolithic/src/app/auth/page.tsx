"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from 'react';
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/state/appState";
import { userLogin, userSignUp } from '@/lib/auth';

import localFont from 'next/font/local';
const virgil = localFont({ src: '../../styles/Virgil.woff2' });

import {
    Card,
    CardContent,
    CardFooter
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Login() {
    const router = useRouter();
    const { isLoading, setIsLoading, currentUser, setCurrentUser } = useAppStore();
    const [error, setError] = useState("");
    const [returnUrl, setReturnUrl] = useState<string>("/");

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        let url = urlParams.get('returnUrl') ?? "/";
        setReturnUrl(url);
    }, []);

    async function submitLoginCredentials(event: FormEvent<HTMLFormElement>) {
        setIsLoading(true);
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email: string = String(formData.get("email")) ?? "";
        const password: string = String(formData.get("password")) ?? "";

        if( email != "" && password != "" ){
            const { results, error } = await userLogin(email, password);

            if (results != null) {
                console.log("Results: ", results);
                if(results != null){
                    setCurrentUser({email: results.email, name: results.name});
                }
                setIsLoading(false);
                router.push(returnUrl);
            } else {
                setError(error);
                console.log("Error: ", error);
            }
    
        }else{
            setError("Missing Credentials.")
        }
        
        setIsLoading(false);
    }

    async function submitSignUpDetails(event: FormEvent<HTMLFormElement>) {
        setIsLoading(true);
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name: string = String(formData.get("name")) ?? "";
        const email: string = String(formData.get("email")) ?? "";
        const password: string = String(formData.get("password")) ?? "";

        if( email != "" && password != "" ){
            const { results, error } = await userSignUp(name, email, password);

            if (results != null) {
                console.log("Results: ", results);
                if(results != null){
                    setCurrentUser({email: results.email, name: results.name});
                }
                setIsLoading(false);
                router.push(returnUrl);
            } else {
                setError(error);
                console.log("Error: ", error);
            }
    
        }else{
            setError("Missing Credentials.")
        }
        
        setIsLoading(false);
    }

    console.log({ loading: isLoading });

    return (
        <main>
            <div className="flex min-h-screen flex-col items-center justify-top pt-36">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <Icons.editorLogo className="mx-auto h-6 w-6" />
                        <p className={`${virgil.className} text-neutral-500 text-3xl`}>
                            the
                            <strong className="text-zinc-950">
                                Bookstore
                            </strong>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Please sign in / sign up to continue.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="login" className="flex flex-col justify-center mt-5">
                    <TabsList>
                        <TabsTrigger className="flex grow" value="login">Login</TabsTrigger>
                        <TabsTrigger className="flex grow" value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <form onSubmit={submitLoginCredentials}>
                            <Card className="w-[350px] sm:w-[450px]">
                                <CardContent>
                                    <div className="grid w-full items-center gap-4 pt-5">
                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                placeholder="Enter registered email address"
                                                type="email"
                                                autoCapitalize="none"
                                                autoComplete="email"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="password">Password</Label>
                                            <Input
                                                id="password"
                                                name="password"
                                                placeholder="Enter password"
                                                type="password"
                                                autoComplete="off"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <div className="grid w-full items-center gap-4">
                                        <button className={cn(buttonVariants())} disabled={isLoading}>
                                            {isLoading && (
                                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Sign In with Email
                                        </button>
                                        {error != "" && (
                                            <p className="px-1 text-xs text-red-600 justify-center text-center">
                                                {error}
                                            </p>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        </form>
                    </TabsContent>
                    <TabsContent value="signup">
                        <form onSubmit={submitSignUpDetails}>
                            <Card className="w-[350px] sm:w-[450px]">
                                <CardContent>
                                    <div className="grid w-full items-center gap-4 pt-5">
                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="Enter your name"
                                                type="name"
                                                autoCapitalize="none"
                                                autoComplete="off"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                placeholder="Enter your email address"
                                                type="email"
                                                autoCapitalize="none"
                                                autoComplete="off"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="flex flex-col space-y-1.5">
                                            <Label htmlFor="password">Password</Label>
                                            <Input
                                                id="password"
                                                name="password"
                                                placeholder="Enter password"
                                                type="password"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <div className="grid w-full items-center gap-4">
                                        <button className={cn(buttonVariants())} disabled={isLoading}>
                                            {isLoading && (
                                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Sign Up with Email
                                        </button>
                                        {error != "" && (
                                            <p className="px-1 text-xs text-red-600 justify-center text-center">
                                                {error}
                                            </p>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        </form>
                    </TabsContent>
                </Tabs>
            </div>
        </main >
    );
}
