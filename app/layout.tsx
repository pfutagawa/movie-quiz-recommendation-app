import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cinequiz-br.mybetterhalf47092.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "CineQuiz BR — acerte, descubra, dê play",
  description: "Um quiz de cinema que transforma seus acertos em uma fila de filmes e séries para assistir nos streamings do Brasil.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  alternates: { canonical: "/" },
  openGraph: {
    title: "CineQuiz BR — acerte, descubra, dê play",
    description: "Teste seu repertório e descubra sua próxima história.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CineQuiz BR — acerte, descubra, dê play" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CineQuiz BR",
    description: "Teste seu repertório e descubra sua próxima história.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
