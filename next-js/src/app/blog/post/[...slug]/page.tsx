import Image from "next/image"
import PlaylistCard from "../../playlistCards";
import Sidebar from "../../sidebar";
import React from "react";
import { sanityFetch } from "@/app/client";
import { PortableText, SanityDocument } from "next-sanity";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";

const projectId = 'fnvy29id';
const dataset = 'tgs'

const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

function eventImage(event: any) {
  let pull = event.thumb.asset._ref;
  let thing = pull ? urlFor(pull)?.url() : null;
  return (thing)
}

function spotifyEmbed(playlist: string) {
  let input = playlist;
  if (input == null) {
    input = "https://open.spotify.com/playlist/67OMv1NpyxUTmUetPeTJ39?si=05467d1c522d4b22"
  };
  const parts = input.split("/")
  let i = 0;
  parts.forEach(function (thing) {
    console.log(i)
    console.log(thing)
    i++
  })
  return (`https://open.spotify.com/embed/${parts[3]}/${parts[4]}`)
}


function bannerResolver(post: any) {
  if (post?.banner == undefined) {
    return (urlFor(post?.thumb)?.height(500)?.url())
  }
  else {
    return (urlFor(post?.banner)?.height(500)?.url())
  }
}


export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const slug = (await params).slug
  const SLUG_QUERY = `*[_type == "post" && slug.current == "${slug}"]`;
  const posts = await sanityFetch<SanityDocument[]>({ query: SLUG_QUERY });
  const post = posts[0];
  return (
    <div className="-mt-10 sm:flex-wrap gap-2.5 md:-mt-20 md:flex-nowrap md:inline-flex md:flex-row md:justify-around w-auto pt-12">
      {/* Whole Site */}
      <div className=" sm:w-screen md:w-10/12 lg:w-8/12 flex-row"> {/* Right Side, Carousel + */}

        <div className="font-roc text-lg text-balance">
          <div className="place-items-center">
            <img
              src={`${bannerResolver(post)}`}
              alt={`${post.name}`}
            />
          </div>
          <div className="xl:text-4xl text-3xl font-bold font-bit text-center relative"> {/* Title */}
            {post.name}
          </div>
          <div className="place-items-center mt-3 -mb-5"> {/* Spotify Embed */}
            <iframe src={`${spotifyEmbed(post.playlistURL)}`} width="90%" height="200" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
          </div>
          <div className="mx-5 text-sm lg:text-lg text-pretty text-justify">
            <PortableText value={post.content}/>
          </div>
        </div>
      </div>
      <div className="sm:w-screen md:w-4/12 lg:w-3/12 flex-col place-items-center justify-end rounded-xl"> {/* Left Side */}
        <Sidebar items={3}></Sidebar>
      </div>
    </div>
  )
}