import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quintaro - That Good Sh*t!",
  description:
    "Quintaro is about moving forward, climbing impossible heights, and perseverance through daydreams. DVD-R format, 28 minute runtime by Quincy Davis.",
  openGraph: {
    title: "Quintaro - That Good Sh*t!",
    description:
      "Quintaro is about moving forward, climbing impossible heights, and perseverance through daydreams. DVD-R format, 28 minute runtime by Quincy Davis.",
    type: "website",
    images: [
      {
        url: "https://cdn.sanity.io/images/fnvy29id/tgs/c701b2099e1b43b7f672e85e6a425692ec0ac1d1-2726x3408.png?h=1000",
        width: 1000,
        height: 1250,
        alt: "Quintaro DVD by Quincy Davis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quintaro - That Good Sh*t!",
    description:
      "Quintaro is about moving forward, climbing impossible heights, and perseverance through daydreams. DVD-R format, 28 minute runtime by Quincy Davis.",
    images: [
      "https://cdn.sanity.io/images/fnvy29id/tgs/c701b2099e1b43b7f672e85e6a425692ec0ac1d1-2726x3408.png?h=1000",
    ],
  },
};

export default function QuintaroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
