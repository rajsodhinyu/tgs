"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const BATCH_SIZE = 6;

type Blog = {
  _id: string;
  name: string;
  slug: { current: string };
  youtube: boolean;
  youtubeURL: string;
  imageUrl: string;
};

export default function SidebarList({ blogs }: { blogs: Blog[] }) {
  const [visible, setVisible] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((prev) => Math.min(prev + BATCH_SIZE, blogs.length));
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [blogs.length]);

  return (
    <div className="flex-col w-full">
      {blogs.slice(0, visible).map((blog) => (
        <div key={blog._id} className="">
          <Link href={`/blog/post/${blog.slug.current}`}>
            <Image
              className="h-auto object-cover w-80 border-opacity-0 hover:border-opacity-100 hover:scale-95 border-4 border-tgs-purple rounded-md"
              src={blog.imageUrl}
              alt={`${blog.name} Cover`}
              width={300}
              height={300}
              quality={100}
            />
          </Link>
        </div>
      ))}
      {visible < blogs.length && <div ref={sentinelRef} className="h-1" />}
    </div>
  );
}
