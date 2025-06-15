import type { Metadata } from "next";
import '../public/fonts/pp-neue-montreal/ppneuemontreal-medium-webfont.woff2';
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
      <body>
        {children}
      </body>
    </html>
  );
}
