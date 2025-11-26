"use client";

import Link from "next/link";
import GlassSurface from "@/components/GlassSurface";
import "@/styles/globals.css";

export default function NavBar() {
    return (
        <div className="nav fixed top-0 left-0 w-full z-50 flex justify-center py-4 font-montserrat text-white" style={{background: 'transparent'}}>
            <GlassSurface
                width={900}
                height={70}
                borderRadius={32}
                className="w-full max-w-5xl px-8 py-2 flex items-center justify-between shadow-xl"
                blur={16}
                opacity={0.92}
                brightness={30}
                borderWidth={0.1}
                backgroundOpacity={0.25}
                mixBlendMode="screen"
            >
                {/* Logo */}
                <Link
                    href="/"
                    className="text-2xl font-bold no-underline mr-8 whitespace-nowrap font-montserrat text-white drop-shadow"
                >
                    {"Hero's Faith"}
                </Link>
                {/* Menu Desktop (toujours affiché) */}
                <div className="flex gap-x-4">
                    <Link
                        href="/stories"
                        className="inline-block font-medium font-montserrat no-underline hover:text-yellow-400 transition-colors text-white drop-shadow"
                    >
                        Mes histoires
                    </Link>
                    <Link
                        href="/read"
                        className="inline-block font-medium font-montserrat no-underline hover:text-yellow-400 transition-colors text-white drop-shadow"
                    >
                        Lire une histoire
                    </Link>
                    <Link
                        href="/contact"
                        className="inline-block font-medium font-montserrat no-underline hover:text-yellow-400 transition-colors text-white drop-shadow"
                    >
                        Comment ça marche ?
                    </Link>
                </div>
                {/* Boutons CTA Desktop */}
                <div className="flex items-center gap-x-4 ml-8">
                    <Link
                        href="/login"
                        className="inline-block font-medium font-montserrat no-underline hover:text-yellow-400 transition-colors text-white drop-shadow"
                    >
                        Se connecter
                    </Link>
                </div>
            </GlassSurface>
        </div>
    );
}
