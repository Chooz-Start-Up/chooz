import type { Metadata } from "next";
import { ThemeProvider } from "@/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chooz — Restaurant Menu Platform",
  description: "Discover, browse, and compare restaurant menus",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
