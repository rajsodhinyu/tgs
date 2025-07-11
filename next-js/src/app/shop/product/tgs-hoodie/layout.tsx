import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TGS Lounge Hoodie - That Good Sh*t!",
  description:
    "The TGS Lounge Set is a two piece, mid-weight, fleece tracksuit featuring reverse appliqué artwork hand drawn by us. $89.00",
  openGraph: {
    title: "TGS Lounge Hoodie - That Good Sh*t!",
    description:
      "The TGS Lounge Set is a two piece, mid-weight, fleece tracksuit featuring reverse appliqué artwork hand drawn by us. $89.00",
    type: "website",
    images: [
      {
        url: "https://cdn.sanity.io/images/fnvy29id/tgs/ceea4804b606a0e7de684e5e82ab36b10d04449b-800x1000.png",
        width: 800,
        height: 1000,
        alt: "TGS Lounge Hoodie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TGS Lounge Hoodie - That Good Sh*t!",
    description:
      "The TGS Lounge Set is a two piece, mid-weight, fleece tracksuit featuring reverse appliqué artwork hand drawn by us. $89.00",
    images: [
      "https://cdn.sanity.io/images/fnvy29id/tgs/ceea4804b606a0e7de684e5e82ab36b10d04449b-800x1000.png",
    ],
  },
};

export default function TgsHoodieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
