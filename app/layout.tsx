import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instatag Video Render — Animated @username Tag Generator",
  description:
    "Create animated @username tags with a verified badge and render them to transparent or green-screen video, GIF or PNG. Runs fully in your browser — no backend, no accounts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
