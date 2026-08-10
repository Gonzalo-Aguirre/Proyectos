import type { Metadata } from "next";
import { Providers } from "@/features/auth/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bitácora del Equipo",
  description: "Registro interno de actividades y retos del equipo.",
};

const themeBootScript = `
(function(){
  try {
    var t = localStorage.getItem('bitacora-theme');
    if (t === 'system' || t === 'light' || t === 'dark' || t === 'ocean') {
      document.documentElement.dataset.theme = t;
    } else {
      document.documentElement.dataset.theme = 'system';
    }
  } catch (e) {
    document.documentElement.dataset.theme = 'system';
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
