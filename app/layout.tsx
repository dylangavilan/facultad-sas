import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getHistorial } from "@/lib/historial";
import { AppSidebar } from "@/components/layout/AppSidebar";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "facultad·sas — Portal académico",
  description: "Historial académico y malla curricular interactiva",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { student } = getHistorial();

  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <div className="layout">
          <AppSidebar student={student} />
          {children}
        </div>
      </body>
    </html>
  );
}
