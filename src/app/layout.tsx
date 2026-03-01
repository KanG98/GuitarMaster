import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { THEMES } from "@/lib/themes";
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
  title: "GuitarMaster - Guitar Tab Reader & Player",
  description:
    "Upload guitar tab images or PDFs and convert them into clean, playable notation with tablature, staff, and numbered notation views.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate theme data for the inline script
  const themeData = Object.fromEntries(
    THEMES.map(t => [t.id, { 
      primary: t.primary, 
      primaryForeground: t.primaryForeground, 
      ring: t.ring 
    }])
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem("guitar-master-theme");
              var themes = ${JSON.stringify(themeData)};
              if (t && themes[t]) {
                var c = themes[t];
                var s = document.createElement("style");
                s.id = "gm-theme";
                s.textContent = ":root{--primary:"+c.primary+";--primary-foreground:"+c.primaryForeground+";--ring:"+c.ring+"}";
                document.head.appendChild(s);
              }
            } catch(e) {}
          })()
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
