import type { Metadata, Viewport } from "next";
import { MotionProvider } from "@/components/animations/motion-provider";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";
import { label, sans, serif } from "./fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.institution} Alumni Association`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.association,
  keywords: ["Newton House", "Patna Science College", "alumni association", "hostel", "Patna", "alumni directory", "reunion"],
  authors: [{ name: siteConfig.association }],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.association,
    title: `${siteConfig.name} — ${siteConfig.statement}`,
    description: siteConfig.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.statement}`,
    description: siteConfig.description,
  },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0b1f38",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={cn(serif.variable, sans.variable, label.variable)} suppressHydrationWarning>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
