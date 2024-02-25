"use client";
import { useRouter, usePathname } from "next/navigation";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import localFont from 'next/font/local';

const virgil = localFont({ src: '../styles/Virgil.woff2' });

import { Icons } from "@/components/icons";
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

interface Props {
    mode: string;
}

export default function Navbar(props: Props) {

    const [navClassOnScroll, setNavClassOnScroll] = useState<string>("bg-orange-50");
    const router = useRouter();

    useEffect(() => {

        const handleScroll = () => {
            if (typeof window !== "undefined" && window.scrollY > 1) {
                setNavClassOnScroll("sticky z-1000 top-0 backdrop-blur-sm bg-orange-50/60");
            } else {
                setNavClassOnScroll("bg-orange-50");
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);

    }, []);


    return (
        <div className={`w-full items-center px-0 mx-auto ${navClassOnScroll} shadow-sm z-40`}>
            <div className="container grid grid-cols-3 flex-row items-center px-2 md:px-0">
                <div className={`${virgil.className} flex`}>
                    <Sheet>
                        <SheetTrigger>
                            <Icons.homeLogo className="mx-auto h-7 w-7 opacity-55 p-1 rounded hover:bg-orange-300" />
                        </SheetTrigger>
                        <SheetContent side="left">
                            <SheetHeader>
                                <SheetTitle>
                                    <p className={`${virgil.className} text-neutral-500 text-3xl`}>
                                        the
                                        <strong className="text-zinc-950">
                                            Bookstore
                                        </strong>
                                    </p>
                                </SheetTitle>
                                <SheetDescription>
                                    This action cannot be undone. This will permanently delete your account
                                    and remove your data from our servers.
                                </SheetDescription>
                            </SheetHeader>
                        </SheetContent>
                    </Sheet>
                    <Link href="/"
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "px-2"
                        )}
                    >
                        <p className={`text-neutral-500 text-xl`}>
                            the
                            <strong className="text-zinc-950">
                                Bookstore
                            </strong>
                        </p>
                    </Link>
                </div>
                <div className="flex items-center justify-end col-span-2 md:space-x-3">
                    <div className="hidden md:flex items-center space-x-2 max-h-[30px] my-3">
                        <Input type="text" className="min-w-80" placeholder="Search by book title, author ..." />
                        <Button className="px-3 py-2 hover:bg-orange-300">
                            <Icons.search className="flex h-5 w-5 opacity-75" />
                        </Button>
                    </div>
                    <div className="relative md:space-x-3">
                        <Button variant="ghost" size="icon" className="inline md:hidden" >
                            <Icons.search className="mx-auto h-6 w-6 opacity-55" />
                        </Button>
                        <Link href="/cart"
                            className={cn(
                                buttonVariants({ variant: "ghost" }),
                                "px-2 py-2 hover:bg-orange-200"
                            )}
                        >
                            <Icons.cart className="inline h-6 w-6 opacity-55" />
                        </Link>
                        <Button variant="ghost" size="icon" className="hidden md:inline hover:bg-orange-200" >
                            <Icons.wishlist className="mx-auto h-6 w-6 opacity-55" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hidden md:inline hover:bg-orange-200" >
                            <Icons.help className="mx-auto h-6 w-6 opacity-55" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className=" hover:bg-orange-200" >
                                    <Icons.profile className="mx-auto h-6 w-6 opacity-55" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 mr-5">
                                <DropdownMenuLabel className="text-gray-400">Profile</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => { router.push("/editor/profile"); }}>Edit Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { router.push("/editor/projects"); }}>My Orders</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { router.push("/editor/raw"); }}>Raw Json</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-gray-400">Navigate To</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => { router.push("/editor/profile"); }}>Edit Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { router.push("/editor/projects"); }}>My Orders</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { router.push("/editor/raw"); }}>Raw Json</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { router.push("/editor/settings"); }}>Profile</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => { router.push("/editor/settings"); }}>Logout</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
}
