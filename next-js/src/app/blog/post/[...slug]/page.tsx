import Image from "next/image";
import PlaylistCard from "../../playlistCards";
import Sidebar from "../../sidebar";
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

function renderSpotifyEmbed(playlist: string) {
  if (playlist == null) {
    return <div className="-my-4"></div>;
  } else {
    const parts = playlist.split("/");
    return (
      <div className="w-full">
        <div className="place-items-center mt-3 -mb-8 max-sm:ml-2">
          <iframe
            src={`https://open.spotify.com/embed/${parts[3]}/${parts[4]}`}
            width="100%"
            height="180"
            allow=" clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          ></iframe>
        </div>
      </div>
    );
  }
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
  if (post.youtube) {
    return renderYoutubeEmbed(post.youtubeURL);
  } else {
    return (
      <img
        className="rounded-md"
        src={`${bannerResolver(post)}`}
        alt={`${post.name}`}
      />
    );
  }
}

async function findWriter(writer: any) {
  if (!writer || !writer._ref) return null;

  const writerQ = `*[_type == "writer" && _id == "${writer._ref}"]{name}`;
  const data: any = await sanityFetch({ query: writerQ });

  return data[0]?.name || null;
}

const components: PortableTextComponents = {
  block: {
    // Ex. 1: customizing common block types
    h1: ({ children }) => (
      <h1 className="text-2xl text-blue-800">{children}</h1>
    ),
    normal: ({ children }) => (
      <p>
        {children} <br />
      </p>
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
    em: ({ children }) => <em className="text-tgs-purple">{children} </em>,

    link: ({ children, value }) => {
      const rel = !value.href.startsWith("/")
        ? "noreferrer noopener"
        : undefined;
      return (
        <a className="underline text-pink-600" href={value.href} rel={rel}>
          {children}
        </a>
      );
    },
  },
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const SLUG_QUERY = `*[_type == "post" && slug.current == "${slug}"]{_id, name, youtube, youtubeURL, thumb, writer, banner, playlistURL, content, slug, date, description}`;
  const posts = await sanityFetch<SanityDocument[]>({ query: SLUG_QUERY });
  const post = posts[0];
  return (
    <div className="font-roc text-lg text-balance max-md:mt-14 max-[300px]:w-80">
      <div className="place-items-center">{renderBanner(post)}</div>
      <div className="xl:text-4xl text-2xl font-bold font-bit mt-4 text-center">
        {" "}
        {/* Title */}
        {post.name}
      </div>
      <div className="xl:text-2xl text-xl font-bit text-center">
        {" "}
        {/* Writer */}
        {post.writer && `${await findWriter(post.writer)} · `}
        {post.date &&
          new Date(post.date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })}
      </div>
      {/* Spotify Embed */}
      <div>{renderSpotifyEmbed(post.playlistURL)}</div>

      <div className="mx-3 text-sm lg:text-lg text-wrap text-justify pb-10 indent-4 md:indent-6 first-letter:text-8xl first-letter:font-title first-letter:text-black ">
        <PortableText value={post.content} components={components} />
      </div>
    </div>
  );
}
