import type { Metadata } from "next";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
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
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
