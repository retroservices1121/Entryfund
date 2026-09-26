import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EntryFund — Financial infrastructure for sports organizers",
  description: "Collect registrations, manage event money, spend from the same balance.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
