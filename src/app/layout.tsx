import type { Metadata, Viewport } from "next";
import { Bangers, Baloo_2 } from "next/font/google";
import "./globals.css";

const display = Bangers({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const body = Baloo_2({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quem é Mais Brabo 🔥",
  description:
    "Jogo de festa: sorteia uma letra, escreva 3 famosos brabos e vote em quem é o mais brabo de todos!",
  applicationName: "Quem é Mais Brabo",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mais Brabo",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e0b3b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
