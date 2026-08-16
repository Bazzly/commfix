import type { Metadata } from "next";
import localFont from "next/font/local";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const display = localFont({
  src: "./fonts/Manrope-Variable.woff2",
  variable: "--font-display",
  weight: "600 800",
  display: "swap",
});

const body = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-body",
  weight: "400 600",
  display: "swap",
});

const dataMono = localFont({
  src: "./fonts/JetBrainsMono-Variable.woff2",
  variable: "--font-data",
  weight: "400 500",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CommunityFix",
  description: "Report and track local infrastructure issues near you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${dataMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
