import type { Metadata } from "next";
import { validatePortalEnv } from "@/lib/env.server";
import "./globals.css";

validatePortalEnv();

export const metadata: Metadata = {
  title: "Portal Valle | Valle D'Incanto",
  description: "Portal de Experiências do Hotel Valle D'Incanto.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
