import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { Cursor } from "@/components/layout/Cursor";
import { GradientBlobs } from "@/components/layout/GradientBlobs";
import { InlineScript } from "@/components/layout/InlineScript";
import { Nav } from "@/components/layout/Nav";
import { Providers } from "@/components/layout/Providers";
import "./globals.css";

const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sahana-kulal.vercel.app"),
  title: "Sahana Kulal — Application Engineer",
  description:
    "Application engineer at Ati Motors building and supporting real-time fleet management, teleoperation and monitoring software for autonomous mobile robots.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Sahana Kulal",
    title: "Sahana Kulal — Application Engineer",
    description:
      "Application engineer at Ati Motors building real-time fleet management, teleoperation and monitoring software for autonomous mobile robots.",
  },
  twitter: { card: "summary_large_image" },
  // Tells the Dark Reader extension to leave this page alone: the site has its own dark theme,
  // and the extension's injected attributes cause React hydration errors.
  other: { "darkreader-lock": "true" },
};

// Runs during HTML parsing, before first paint, so the saved theme never flashes.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable} antialiased`}
    >
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="min-h-full overflow-x-clip" suppressHydrationWarning>
        <Providers>
          <GradientBlobs />
          <div aria-hidden className="noise" />
          <Nav />
          {children}
          <Cursor />
        </Providers>
      </body>
    </html>
  );
}
