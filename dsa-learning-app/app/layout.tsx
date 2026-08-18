import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AppShell } from "@/components/AppShell";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono-src",
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: {
    default: "Algorithm Atlas",
    template: "%s — Algorithm Atlas",
  },
  description:
    "Learn data structures & algorithms by watching them run: step-by-step visualizers with synced code, custom input, quizzes, and progress tracking.",
  manifest: `${basePath}/manifest.webmanifest`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
