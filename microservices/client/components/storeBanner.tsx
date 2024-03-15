"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

export default function StoreBanner() {
    const [booksData, setBooksData] = useState<any>([]);

    useEffect(() => {
        const offset = Math.floor(Math.random() * 200)
        let query = "/api/products/list?limit=5&offset=" + offset;
        fetch(query)
        .then((res) => {
            if (!res.ok) {
                throw new Error(res.statusText); // Handle errors
            }
            return res.json(); // Parse JSON response
        })
        .then((res) => {
            if (res.data) {
                setBooksData(res.data);
                console.log(res);
            }
            console.log(res);
        })
        .catch((err: string) => {
            console.error(err)
        });
    }, []);
    return (
        <main className=" justitfy-end min-h-[200px] sm:min-h-[370px] bg-orange-100 pt-1 mb-5 items-center" >
            <div className="container flex flex-row w-full min-h-[200px] sm:min-h-[360px] items-center justify-start px-2 md:p-auto">
                {(booksData.length > 0 && (
                    <div className="flex flex-wrap w-full gap-2">
                        <Carousel className="w-full" plugins={[Autoplay({ delay: 2000, }),]}>
                            <CarouselContent className="-ml-1 gap-2">
                                {booksData.map((item: any, index: number) => (
                                    <CarouselItem key={index} className="ml-1 basis-1/3 md:basis-3/6 bg-card rounded-lg p-0" >
                                        <div className="min-h-[180px] sm:min-h-[350px] flex flex-col md:flex-row px-0">
                                            <div className="flex p-1 md:p-3 rounded-lg items-center">
                                                <Image
                                                    src={item.thumbnail_url}
                                                    alt={item.title}
                                                    width="200"
                                                    height="200"
                                                    className="rounded-lg min-w-[50px] md:min-w-[256px] max-h-[336px] "
                                                />
                                            </div>
                                            <div className="flex flex-col md:p-5">
                                                <h2 className="text-sm md:text-lg md:font-bold px-2">{item.title}</h2> 
                                                <Separator className="w-full mt-2 mb-2 hidden md:block" />
                                                <div className="flex flex-grow text-sm text-justify hidden md:block">{item.short_description}</div>   
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                    </div>
                ))}
            </div>
        </main>
    );
}
