import { Metadata } from "next";

export const metadata: Metadata = {
  title: "THATGOODSH*T RING - That Good Sh*t!",
  description:
    "Rep That Good Sh*t on your finger, in your choice of 14K Gold or 925K Sterling Silver. $55.00",
  openGraph: {
    title: "THATGOODSH*T RING - That Good Sh*t!",
    description:
      "Rep That Good Sh*t on your finger, in your choice of 14K Gold or 925K Sterling Silver. $55.00",
    type: "website",
    images: [
      {
        url: "https://cdn.sanity.io/images/fnvy29id/tgs/752b435dd7941af6a65a754ec2f27b13d03952c4-800x1000.png",
        width: 800,
        height: 1000,
        alt: "THATGOODSH*T RING",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "THATGOODSH*T RING - That Good Sh*t!",
    description:
      "Rep That Good Sh*t on your finger, in your choice of 14K Gold or 925K Sterling Silver. $55.00",
    images: [
      "https://cdn.sanity.io/images/fnvy29id/tgs/752b435dd7941af6a65a754ec2f27b13d03952c4-800x1000.png",
    ],
  },
};

export default function TgsRingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
