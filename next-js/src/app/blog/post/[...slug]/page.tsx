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

function renderEmbed(playlist: string) {
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
        <div className="relative pb-[56.25%] h-0 overflow-hidden  mx-auto shadow-lg">
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-md border-2 border-tgs-purple"
            src={`https://www.youtube.com/embed/${videoID}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
      {post.youtube ? (
        <>
          <div>{renderYoutubeEmbed(post.youtubeURL)}</div>
          <div className="xl:text-4xl text-3xl font-bold font-bit mt-4 text-center">
            {" "}
            {/* Title */}
            {post.name}
          </div>

          {/* Date for YouTube post */}
          <div className="text-lg font-bit text-center text-gray-600 mb-2">
            {post.date &&
              new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
          </div>

          {/* YouTube Embed */}

          {/* Description for YouTube post */}
          {post.description && (
            <div className="max-w-3xl mx-auto my-6 px-4 text-lg">
              <p className="text-gray-800 leading-relaxed">
                {post.description}
              </p>
            </div>
          )}

          {/* View on YouTube button */}
          <div className="flex justify-center mt-4 mb-8">
            <a
              href={post.youtubeURL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-tgs-purple text-white px-4 py-2 rounded-md hover:bg-opacity-80 transition-all font-bit flex items-center"
            >
              <span>Watch on YouTube</span>
              <svg
                className="w-5 h-5 ml-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
              </svg>
            </a>
          </div>
        </>
      ) : (
        <>
          <div className="place-items-center">
            <img
              className="rounded-md"
              src={`${bannerResolver(post)}`}
              alt={`${post.name}`}
            />
          </div>
          <div className="xl:text-4xl text-3xl font-bold font-bit mt-4 text-center">
            {" "}
            {/* Title */}
            {post.name}
          </div>
          <div className="xl:text-2xl text-xl font-bit text-center">
            {" "}
            {/* Writer */}
            {post.writer && (await findWriter(post.writer))}
          </div>
          {/* Spotify Embed */}
          <div>{renderEmbed(post.playlistURL)}</div>

          <div className="mx-3 text-sm lg:text-lg text-wrap text-justify pb-10 indent-4 md:indent-6 first-letter:text-8xl first-letter:font-title first-letter:text-black ">
            <PortableText value={post.content} components={components} />
          </div>
        </>
      )}
    </div>
  );
}
