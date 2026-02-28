import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageContainer } from "@/components/layout/PageContainer";
import { getHistorial } from "@/lib/historial";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Historial Académico | Facultad SAS",
  description: "Consulta tu historial académico y correlativas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { student } = getHistorial();

  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar studentName={student.nombre} />
          <PageContainer>{children}</PageContainer>
        </div>
      </body>
    </html>
  );
}
