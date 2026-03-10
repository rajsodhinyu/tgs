import Image from "next/image";
import PlaylistCard from "../playlistCards";
import Sidebar from "../sidebar";
import React from "react";
import { sanityFetch } from "@/app/client";
import {
  PortableText,
  PortableTextComponents,
  SanityDocument,
} from "next-sanity";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import { writer } from "repl";
import Link from "next/link";
import { Metadata } from "next";
import PostEmbed from "../PostEmbed";
import TrackEmbedBlock from "../TrackEmbedBlock";
import PlaylistEmbedBlock from "../PlaylistEmbedBlock";
import TrackGrid from "../TrackGrid";
import { preprocessContent } from "../preprocessContent";

const projectId = "fnvy29id";
const dataset = "tgs";

const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

function eventImage(event: any) {
  let pull = event.thumb.asset._ref;
  let thing = pull ? urlFor(pull)?.url() : null;
  return thing;
}

function renderYoutubeEmbed(youtubeURL: string) {
  if (youtubeURL == null) {
    return <div className="-my-4"></div>;
  } else {
    // Extract YouTube video ID from URL
    const getYoutubeID = (url: string) => {
      const regExp =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[7].length === 11 ? match[7] : null;
    };

    const videoID = getYoutubeID(youtubeURL);

    if (!videoID) return <div>Invalid YouTube URL</div>;

    return (
      <div className="w-full my-6">
        <div className="relative pb-[56.5%] h-0 overflow-hidden mx-auto ">
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-md border-4 border-tgs-purple"
            src={`https://www.youtube.com/embed/${videoID}?rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  }
}

function bannerResolver(post: any) {
  if (post?.banner == undefined) {
    return urlFor(post?.thumb)?.fit("crop").width(700).height(700)?.url();
  } else {
    return urlFor(post?.banner)?.height(720).width(1280)?.url();
  }
}

function renderBanner(post: any) {
  if (post.youtubeURL) {
    return renderYoutubeEmbed(post.youtubeURL);
  } else {
    return (
      <Image
        className="rounded-md"
        src={`${bannerResolver(post)}`}
        priority={true}
        width={1920}
        height={1080}
        alt={`${post.name}`}
      />
    );
  }
}

async function findWriter(writer: any) {
  if (!writer || !writer._ref) return null;

  const writerQ = `*[_type == "writer" && _id == "${writer._ref}"]{name, url}`;
  const data: any = await sanityFetch({ query: writerQ });

  if (!data[0]) return null;
  return { name: data[0].name, url: data[0].url || null };
}

const components: PortableTextComponents = {
  block: {
    // Ex. 1: customizing common block types
    h1: ({ children }) => (
      <h1 className="text-center text-2xl font-bit">{children}</h1>
    ),
    normal: ({ children, value }) => {
      const v = value as any;
      const indent = v._afterTrack ? "" : "indent-4 md:indent-6";
      const justify = "";
      return (
        <p className={`${indent} ${justify}`}>
          {children} <br />
        </p>
      );
    },
    blockquote: ({ children }) => (
      <div className="text-sm text-center font-thin ">{children}</div>
    ),
  },
  list: {
    // Ex. 1: customizing common list types
    bullet: ({ children }) => <ul className="mt-xl">{children}</ul>,
    number: ({ children }) => <ol className="mt-lg">{children}</ol>,
  },
  listItem: {
    // Ex. 1: customizing common list types
    bullet: ({ children }) => (
      <li style={{ listStyleType: "disc" }}>{children}</li>
    ),
    number: ({ children }) => (
      <li style={{ listStyleType: "decimal" }}>{children}</li>
    ),
  },
  marks: {
    em: ({ children }) => <em className="text-white">{children} </em>,

    link: ({ children, value }) => {
      const rel = !value.href.startsWith("/")
        ? "noreferrer noopener"
        : undefined;
      return (
        <a className="underline text-white" href={value.href} rel={rel}>
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <div className="my-2">
          <Image
            className="rounded-md w-full"
            src={urlFor(value)?.url() || ""}
            alt={value.alt || ""}
            width={1200}
            height={800}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      );
    },
    spotifyEmbed: ({ value }) => {
      if (!value?.url) {
        return null;
      }

      const parts = value.url.split("/");
      if (parts.length < 5) {
        return <div>Invalid Spotify URL</div>;
      }

      return (
        <div className="w-full -mb-4">
          <iframe
            src={`https://open.spotify.com/embed/${parts[3]}/${parts[4]}`}
            width="100%"
            height="180"
            allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="rounded-md"
          ></iframe>
          {value.caption && (
            <p className="text-sm text-white/60 mt-2 text-center">
              {value.caption}
            </p>
          )}
        </div>
      );
    },
    trackEmbed: ({ value }) => {
      return (
        <TrackEmbedBlock
          spotifyUrl={value?.spotifyUrl}
          appleMusicUrl={value?.appleMusicUrl}
          trackName={value?.trackName}
          artistName={value?.artistName}
          albumArt={value?.albumArt}
          heading={value?.heading}
          subheading={value?.subheading}
          alignment={value?.alignment || "left"}
        />
      );
    },
    trackGrid: ({ value }) => {
      return <TrackGrid tracks={value?.tracks || []} />;
    },
    playlistEmbed: ({ value }) => {
      return (
        <PlaylistEmbedBlock
          name={value?.name}
          description={value?.description}
          coverUrl={value?.coverUrl}
          spotifyUrl={value?.spotifyUrl}
          appleMusicUrl={value?.appleMusicUrl}
          hasSidebar
        />
      );
    },
    appleMusicEmbed: ({ value }) => {
      if (!value?.url) {
        return null;
      }

      // Transform: https://music.apple.com/... -> https://embed.music.apple.com/...
      // Add required query params for proper embed display
      const baseEmbedUrl = value.url.replace(
        "https://music.apple.com",
        "https://embed.music.apple.com",
      );
      const separator = baseEmbedUrl.includes("?") ? "&" : "?";
      const embedUrl = `${baseEmbedUrl}${separator}app=music&theme=light`;

      return (
        <div className="w-full">
          <iframe
            src={embedUrl}
            width="100%"
            height="175"
            title="Apple Music Player"
            allow="autoplay *; encrypted-media *; clipboard-write"
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
            style={{
              border: 0,
              borderRadius: "12px",
              width: "100%",
              height: "175px",
              maxWidth: "660px",
            }}
          ></iframe>
          {value.caption && (
            <p className="text-sm text-white/60 mt-2 text-center">
              {value.caption}
            </p>
          )}
        </div>
      );
    },
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  const SLUG_QUERY = `*[_type == "post" && slug.current == "${slug}"]{_id, name, youtubeURL, thumb, writer, banner, playlistURL, appleMusicURL, content, slug, date, description}`;
  const posts = await sanityFetch<SanityDocument[]>({ query: SLUG_QUERY });
  const post = posts[0];

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  // Get the image URL for OpenGraph
  const getImageUrl = () => {
    if (post.youtubeURL) {
      // For YouTube videos, use the YouTube thumbnail
      const getYoutubeID = (url: string) => {
        const regExp =
          /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[7].length === 11 ? match[7] : null;
      };
      const videoID = getYoutubeID(post.youtubeURL);
      if (videoID) {
        return `https://img.youtube.com/vi/${videoID}/maxresdefault.jpg`;
      }
    }

    // Use banner if available, otherwise use thumb
    if (post.thumb) {
      return urlFor(post.thumb)?.fit("crop").width(700).height(700)?.url();
    }

    return null;
  };

  const imageUrl = getImageUrl();
  const writerData = post.writer ? await findWriter(post.writer) : null;
  const writerName = writerData?.name || null;
  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : null;

  const title = post.name || "Blog Post";
  const description =
    post.description ||
    `${writerName ? `By ${writerName}` : ""}${writerName && formattedDate ? " • " : ""}${formattedDate || ""}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: post.youtubeURL ? 1280 : post.banner ? 1280 : 700,
            height: post.youtubeURL ? 720 : post.banner ? 720 : 700,
            alt: title,
          },
        ],
      }),
      ...(post.date && {
        publishedTime: new Date(post.date).toISOString(),
      }),
      ...(writerName && {
        authors: [writerName],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl && {
        images: [imageUrl],
      }),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const SLUG_QUERY = `*[_type == "post" && slug.current == "${slug}"]{_id, name, youtubeURL, thumb, writer, banner, playlistURL, appleMusicURL, content, slug, date, description}`;
  const posts = await sanityFetch<SanityDocument[]>({ query: SLUG_QUERY });
  const post = posts[0];
  return (
    <div className="font-roc text-lg text-balance text-white max-[300px]:w-80">
      <div className="place-items-center">{renderBanner(post)}</div>
      <div className="xl:text-4xl text-2xl font-bold font-title mt-4 text-center uppercase">
        {/* Title */}
        {post.name}
      </div>
      <div className="xl:text-xl text-xl font-roc text-center pt-2 text-white/80">
        {/* Writer */}
        {post.writer && await (async () => {
          const writer = await findWriter(post.writer);
          if (!writer) return null;
          return <>
            {writer.url ? (
              <Link href={writer.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {writer.name}
              </Link>
            ) : writer.name}
            {" • "}
          </>;
        })()}
        {post.date &&
          new Date(post.date).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })}
      </div>
      {/* Spotify / Apple Music Embed */}
      <PostEmbed
        spotifyURL={post.playlistURL}
        appleMusicURL={post.appleMusicURL}
      />

      <div className="mx-3 text-base md:text-lg lg:text-xl text-justify text-pretty pt-10 pb-6 first-letter:text-4xl first-letter:font-title first-letter:text-white">
        <PortableText
          value={preprocessContent(post.content)}
          components={components}
        />
      </div>
    </div>
  );
}
