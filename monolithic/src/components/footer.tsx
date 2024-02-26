"use client";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator"

export default function Footer() {
    const router = useRouter();

    return (
        <main className="w-full justitfy-end" >
            <div className="flex flex-row w-full items-center justify-center">
                <p className="text-center p-4 text-sm md:p-3">
                    Built by&nbsp;<u><a href="https://github.com/nivedrn">nivedrn</a></u> as part of reasearch study @ SRH. The source code is available on&nbsp;<u><a href="https://github.com/nivedrn/pwa-prototypes">GitHub</a></u>.
                </p>
            </div>
        </main>
    );
}
