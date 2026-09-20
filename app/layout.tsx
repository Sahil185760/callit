import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Callit — Prediction Leagues",
  description: "Private prediction leagues with friends. Make predictions and compete with play money.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
