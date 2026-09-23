import type { Metadata } from "next";
import "./globals.css";
import { Ubuntu, Rokkitt } from 'next/font/google'
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";

const rokkitt = Rokkitt({subsets:['latin'],variable:'--font-rokkitt', display: 'swap'});

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-ubuntu',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Orion Cloud",
  description: "Orion Cloud - An easy to use, free file storage system.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased font-body", ubuntu.variable, rokkitt.variable)}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
