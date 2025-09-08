import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://optimal-birth-timing.vercel.app'),
  title: "Optimal Birth Timing Calculator",
  description: "Scientific calculator for determining optimal conception and birth timing based on solar cycles, seasonality, and geographic factors",
  keywords: ["birth timing", "solar cycles", "seasonality", "health outcomes", "scientific calculator"],
  authors: [{ name: "Alpha App" }],
  creator: "Alpha App",
  publisher: "Alpha App",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Optimal Birth Timing Calculator',
    description: 'Scientific calculator for determining optimal conception and birth timing based on solar cycles, seasonality, and geographic factors',
    siteName: 'Optimal Birth Timing Calculator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Optimal Birth Timing Calculator - Scientific approach to birth timing'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Optimal Birth Timing Calculator',
    description: 'Scientific calculator for determining optimal conception and birth timing based on solar cycles, seasonality, and geographic factors',
    images: ['/og-image.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
