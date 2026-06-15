import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useClient} from 'sanity'
import {useRouter} from 'sanity/router'
import styled from 'styled-components'

/**
 * "New YouTube Interview" builder. Lists every public upload on the TGS channel
 * (via the Next.js /api/youtube/videos proxy), hides the ones that already have
 * a post, and turns a click into a ready-to-edit draft: title, description,
 * publish date, canonical watch URL, and a square-cropped thumbnail. The editor
 * then adds the custom color, featured album, and writer by hand.
 *
 * Same plumbing as WeeklyRoundupBuilder: useClient to write, router to jump into
 * the new draft, and the Next app for anything that needs a server-side secret.
 */

const API_URL =
  (import.meta as any).env?.SANITY_STUDIO_SPOTIFY_API_URL || 'https://www.thatgoodsht.com'

interface Video {
  videoId: string
  url: string
  title: string
  description: string
  publishedAt: string
  thumbnailUrl: string
  durationSeconds: number
}

// ── Helpers ──

// Matches the frontend's extractor (blog/[...slug]/page.tsx) so a stored URL in
// any form (watch?v=, youtu.be/, embed/) maps to the same id we list by.
function getYoutubeID(url: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

// ISO datetime -> "YYYY-MM-DD" for the post's `date` field.
function isoToDate(iso: string) {
  return (iso || '').slice(0, 10)
}

// "2024-11-05T..." -> "Nov 5, 2024" for the card label.
function dateLabel(iso: string) {
  const d = isoToDate(iso)
  const [y, m, day] = d.split('-')
  if (!y || !m || !day) return ''
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${months[Number(m) - 1]} ${Number(day)}, ${y}`
}

// seconds -> "M:SS" (or "H:MM:SS"). Empty for 0 (livestreams have no duration).
function formatDuration(s: number) {
  if (!s || s < 0) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

const URL_RE = /https?:\/\/[^\s<>]+/g
const TRAIL_PUNCT = /[).,;:!?'"]+$/

// Turn one paragraph of plain text into a Portable Text block with real link
// annotations. When a URL is introduced by "… here:" we link the word "here"
// and drop the bare URL (reads like the outro: "Listen to Foggieraw here");
// otherwise the URL itself becomes the clickable link.
function paragraphToBlock(text: string, blockKey: string) {
  const children: unknown[] = []
  const markDefs: unknown[] = []
  let spanN = 0
  let linkN = 0
  let cursor = 0

  const pushText = (t: string, marks: string[] = []) => {
    if (!t) return
    children.push({_type: 'span', _key: `${blockKey}s${spanN++}`, text: t, marks})
  }

  URL_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = URL_RE.exec(text))) {
    let url = m[0]
    let trailing = ''
    const tm = url.match(TRAIL_PUNCT) // don't swallow a sentence's ").,;:"
    if (tm) {
      trailing = tm[0]
      url = url.slice(0, url.length - trailing.length)
    }
    const before = text.slice(cursor, m.index)
    cursor = m.index + m[0].length

    const key = `${blockKey}l${linkN++}`
    markDefs.push({_type: 'link', _key: key, href: url})

    const anchor = before.match(/^([\s\S]*?)(\bhere\b)(\s*[:\-–—]?\s*)$/i)
    if (anchor) {
      pushText(anchor[1])
      pushText(anchor[2], [key]) // "here" carries the link
      // anchor[3] (": "), the URL, and its trailing punctuation are dropped
    } else {
      pushText(before)
      pushText(url, [key])
      pushText(trailing)
    }
  }
  pushText(text.slice(cursor))

  if (children.length === 0) pushText(text) // a block must have ≥1 child
  return {_type: 'block', _key: blockKey, style: 'normal', markDefs, children}
}

// Split on blank lines into paragraphs, then linkify each.
function descriptionToBlocks(desc: string) {
  return (desc || '')
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text, i) => paragraphToBlock(text, `yt${i}`))
}

// ── Component ──

export function YoutubePicker() {
  const client = useClient({apiVersion: '2024-04-01'})
  const router = useRouter()

  const [videos, setVideos] = useState<Video[]>([])
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creatingId, setCreatingId] = useState('')
  const [status, setStatus] = useState('')
  const [shortsHidden, setShortsHidden] = useState(0)
  const didLoad = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [ytRes, posts] = await Promise.all([
        fetch(`${API_URL}/api/youtube/videos`).then((r) => r.json()),
        client.fetch<{youtubeURL?: string}[]>(
          '*[_type == "post" && defined(youtubeURL)]{youtubeURL}',
        ),
      ])
      if (ytRes.error) throw new Error(ytRes.error)

      const used = new Set<string>()
      for (const p of posts || []) {
        const id = getYoutubeID(p.youtubeURL || '')
        if (id) used.add(id)
      }
      setUsedIds(used)
      setVideos(ytRes.videos || [])
      setShortsHidden(ytRes.shortsFiltered || 0)
    } catch (err: any) {
      setError(err.message || 'Could not load videos.')
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    if (didLoad.current) return
    didLoad.current = true
    load()
  }, [load])

  const available = useMemo(() => videos.filter((v) => !usedIds.has(v.videoId)), [videos, usedIds])

  const createDraft = useCallback(
    async (video: Video) => {
      setCreatingId(video.videoId)
      setError('')
      try {
        const slug = slugify(video.title) || video.videoId
        const baseId = `youtube-${video.videoId}`

        // Thumbnail is left blank on purpose — add a square one in the editor.
        setStatus('Creating draft…')
        await client.createOrReplace({
          _id: `drafts.${baseId}`,
          _type: 'post',
          name: video.title,
          slug: {_type: 'slug', current: slug},
          date: isoToDate(video.publishedAt),
          youtubeURL: video.url,
          private: true,
          content: descriptionToBlocks(video.description),
        })

        setStatus('Opening draft…')
        router.navigateIntent('edit', {id: baseId, type: 'post'})
      } catch (err: any) {
        setError(err.message || 'Could not create the draft.')
        setStatus('')
        setCreatingId('')
      }
    },
    [client, router],
  )

  return (
    <Wrapper>
      <Header>
        <div>
          <Title>New YouTube Interview</Title>
          {!loading && !error && (
            <Subtitle>
              {available.length} available
              {shortsHidden ? ` · ${shortsHidden} Shorts hidden` : ''}
            </Subtitle>
          )}
        </div>
        <RefreshBtn type="button" onClick={load} disabled={loading || Boolean(creatingId)}>
          Refresh
        </RefreshBtn>
      </Header>

      {(error || status) && <Note data-kind={error ? 'error' : 'ok'}>{error || status}</Note>}

      {loading && <Empty>Loading videos…</Empty>}

      {!loading && !error && available.length === 0 && (
        <Empty>Every video already has a post. 🎉</Empty>
      )}

      <Grid>
        {available.map((video) => {
          const busy = creatingId === video.videoId
          const disabled = Boolean(creatingId)
          return (
            <Card
              key={video.videoId}
              type="button"
              onClick={() => !disabled && createDraft(video)}
              disabled={disabled}
              $busy={busy}
            >
              <Thumb>
                {video.thumbnailUrl && <img src={video.thumbnailUrl} alt="" />}
                {!busy && formatDuration(video.durationSeconds) && (
                  <Duration>{formatDuration(video.durationSeconds)}</Duration>
                )}
                {busy && <Spinner>Creating…</Spinner>}
              </Thumb>
              <CardBody>
                <CardTitle>{video.title}</CardTitle>
                <CardDate>{dateLabel(video.publishedAt)}</CardDate>
              </CardBody>
            </Card>
          )
        })}
      </Grid>
    </Wrapper>
  )
}

// ── Styled ──

const Wrapper = styled.div`
  --text-primary: #000;
  --text-secondary: #666;
  --bg-neutral: #f5f5f5;
  --bg-input: #fff;
  --border-color: #e0e0e0;

  [data-scheme='dark'] & {
    --text-primary: #e8e8e8;
    --text-secondary: #aaa;
    --bg-neutral: #1e1e2e;
    --bg-input: #1e1e2e;
    --border-color: #444;
  }

  padding: 1.5rem;
  height: 100%;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-primary);
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`

const Title = styled.h2`
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  font-weight: 700;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
  max-width: 60ch;
`

const RefreshBtn = styled.button`
  flex-shrink: 0;
  border: none;
  border-radius: 4px;
  background: #6c5cbe;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  padding: 0.45rem 0.9rem;
  cursor: pointer;
  &:hover {
    opacity: 0.88;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`

const Note = styled.div`
  margin-bottom: 1rem;
  padding: 0.5rem 0.6rem;
  border-radius: 4px;
  font-size: 0.78rem;
  &[data-kind='error'] {
    background: #ffe7e7;
    color: #8a1d1d;
  }
  &[data-kind='ok'] {
    background: #e9f6ef;
    color: #15573b;
  }
`

const Empty = styled.div`
  padding: 2.5rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
`

const Card = styled.button<{$busy?: boolean}>`
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-input);
  color: inherit;
  font-family: inherit;
  cursor: pointer;
  transition:
    border-color 0.12s,
    transform 0.12s;
  &:hover:not(:disabled) {
    border-color: #6c5cbe;
    transform: translateY(-2px);
  }
  &:disabled {
    cursor: default;
    opacity: ${(p) => (p.$busy ? 1 : 0.5)};
  }
`

const Thumb = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--bg-neutral);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

const Duration = styled.span`
  position: absolute;
  right: 6px;
  bottom: 6px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 3px;
  line-height: 1.45;
`

const Spinner = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(108, 92, 190, 0.85);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
`

const CardBody = styled.div`
  padding: 0.6rem 0.7rem;
`

const CardTitle = styled.div`
  font-size: 0.83rem;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const CardDate = styled.div`
  margin-top: 0.3rem;
  font-size: 0.72rem;
  color: var(--text-secondary);
`
