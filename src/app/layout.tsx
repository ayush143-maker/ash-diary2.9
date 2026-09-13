import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { cn } from "@/lib/cn";
import { ToastProvider } from "@/context/ToastProvider";
import { SettingsProvider } from "@/context/SettingsProvider";
import { ProfileProvider } from "@/context/ProfileProvider";
import { JournalProvider } from "@/context/JournalProvider";
import { AppShell } from "@/components/layout/AppShell";
import { ToastViewport } from "@/components/ui/Toast";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ASH DIARY",
    template: "%s · ASH DIARY",
  },
  description: "A private, calm place for your days.",
  icons: { icon: "/app-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F7F9F0",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(fraunces.variable, inter.variable)}
    >
      <body>
        <ToastProvider>
          <SettingsProvider>
            <ProfileProvider>
              <JournalProvider>
                <AppShell>{children}</AppShell>
                <ToastViewport />
              </JournalProvider>
            </ProfileProvider>
          </SettingsProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
