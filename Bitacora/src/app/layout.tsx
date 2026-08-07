import type { Metadata } from "next";
import { Providers } from "@/features/auth/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bitácora del Equipo",
  description: "Registro interno de actividades y problemas del equipo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
