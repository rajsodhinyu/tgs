import Link from "next/link";
import ChevronDots from "../ChevronDots";

export default function BackLink({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Back"
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
    >
      <ChevronDots direction="left" color="white" />
    </Link>
  );
}
