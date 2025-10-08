import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crate",
  description: "Track, rate, and share your music journey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-system">
        {children}
      </body>
    </html>
  );
}
