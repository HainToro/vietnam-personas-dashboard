import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vietnam Personas - Analytics Overview Dashboard",
  description: "Trực quan hoá phân bố dữ liệu Persona Việt Nam (nvidia/Nemotron-Personas-Vietnam)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
