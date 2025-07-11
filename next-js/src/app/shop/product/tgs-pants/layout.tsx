import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lounge Pant - That Good Sh*t!",
  description:
    "The TGS Lounge Set is a two piece, mid-weight, fleece tracksuit featuring reverse appliqué artwork hand drawn by us. $79.00",
  openGraph: {
    title: "Lounge Pant - That Good Sh*t!",
    description:
      "The TGS Lounge Set is a two piece, mid-weight, fleece tracksuit featuring reverse appliqué artwork hand drawn by us. $79.00",
    type: "website",
    images: [
      {
        url: "https://cdn.sanity.io/images/fnvy29id/tgs/af4a48b28edc5b22dabedfc9a3950dd30c0959c1-800x1000.png",
        width: 800,
        height: 1000,
        alt: "TGS Lounge Pant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lounge Pant - That Good Sh*t!",
    description:
      "The TGS Lounge Set is a two piece, mid-weight, fleece tracksuit featuring reverse appliqué artwork hand drawn by us. $79.00",
    images: [
      "https://cdn.sanity.io/images/fnvy29id/tgs/af4a48b28edc5b22dabedfc9a3950dd30c0959c1-800x1000.png",
    ],
  },
};

export default function TgsPantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
