import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Primadex",
  description: "Full-stack platform UI demo (Primadex).",
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "fztlVyPpL-6K_qNR8ORAv2IcNq2j4ToFQ1YAzIF3uk8",
  },
};

import SessionWrapper from "@/components/auth/SessionWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
