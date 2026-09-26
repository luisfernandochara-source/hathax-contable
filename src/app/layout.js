
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals-built.css";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata = {
  title: "HATHAX · Plataforma Contable Inteligente",
  description: "Plataforma contable inteligente para gestión multi-empresa.",
  icons: { icon: "/brand/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
