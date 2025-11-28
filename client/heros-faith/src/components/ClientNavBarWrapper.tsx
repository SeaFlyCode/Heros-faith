"use client";
import { usePathname } from "next/navigation";
import NavBar from "./NavBar/NavBar";

export default function ClientNavBarWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) return null;
  return <NavBar />;
}

