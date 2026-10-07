import type { Metadata } from "next";
import localFont from "next/font/local";
import { validatePortalEnv } from "@/lib/env.server";
import "./globals.css";

validatePortalEnv();

const inter = localFont({ src: "../../public/fonts/inter-variable.ttf", variable: "--font-inter", weight: "100 900", display: "swap" });
const playfair = localFont({ src: "../../public/fonts/playfair-display-variable.ttf", variable: "--font-playfair", weight: "400 900", display: "swap" });

export const metadata: Metadata = {
  title: "Portal Valle | Valle D'Incanto",
  description: "Portal da Recepção do Hotel Valle D'Incanto.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
