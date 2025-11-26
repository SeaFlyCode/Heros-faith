import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription - Hero's Faith",
  description: "Créez votre compte Hero's Faith",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

