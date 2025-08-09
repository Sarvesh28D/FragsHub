import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FragsHub - Esports Tournament Platform",
  description: "The ultimate esports tournament management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
