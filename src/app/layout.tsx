import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  // TODO(launch): switch metadataBase to https://valuation.fi when domain moves
  metadataBase: new URL("https://valuation.fi"),
  title: "AI-arvonmääritysraportti suomalaiselle yritykselle | Valuatum",
  description:
    "Tilaa AI-avusteinen yrityksen arvonmääritysraportti. Raportti sisältää arvion yrityksen arvosta, arvostusvälin, menetelmät, riskit ja arvon ajurit.",
  keywords: [
    "yrityksen arvonmääritys",
    "yrityksen arvo",
    "arvoraportti",
    "yrityskauppa",
    "yrityksen myynti",
    "sukupolvenvaihdos",
    "AI-arvonmääritys",
    "yrityksen arvon laskeminen",
  ],
  openGraph: {
    title: "AI-arvonmääritysraportti suomalaiselle yritykselle | Valuatum",
    description:
      "Yrityksen arvo, arvostusväli, menetelmät, riskit ja arvon ajurit yhdessä PDF-raportissa.",
    locale: "fi_FI",
    type: "website",
    siteName: "Valuatum Arvonmääritys",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
