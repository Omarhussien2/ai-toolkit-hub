import type { Metadata } from "next";
import { Geist_Mono, Alexandria } from "next/font/google";
import "./globals.css";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyToolkit | دليل أدوات الذكاء الاصطناعي",
  description:
    "موقع وتطبيق يجمع أدوات الذكاء الاصطناعي والتقنية مع حفظ روابط سريع ونسخ احتياطي.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://web-sigma-eight-44.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.svg"],
  },
  openGraph: {
    title: "MyToolkit",
    description: "AI and tech tools hub with fast browser link capture.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "MyToolkit logo" }],
  },
  twitter: {
    card: "summary",
    title: "MyToolkit",
    description: "AI and tech tools hub with fast browser link capture.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${alexandria.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
