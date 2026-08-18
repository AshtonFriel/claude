import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AppShell } from "@/components/AppShell";
import { ProgressProvider } from "@/lib/progress";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-src",
});
const body = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-body-src",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono-src",
});

export const metadata: Metadata = {
  title: {
    default: "Algorithm Atlas",
    template: "%s — Algorithm Atlas",
  },
  description:
    "Learn data structures & algorithms by watching them run: step-by-step visualizers with synced code, custom input, quizzes, and progress tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <ProgressProvider>
            <AppShell>{children}</AppShell>
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
