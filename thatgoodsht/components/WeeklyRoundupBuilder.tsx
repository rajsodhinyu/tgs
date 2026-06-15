import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useClient} from 'sanity'
import {useRouter} from 'sanity/router'
import styled from 'styled-components'

// The Next.js app hosts the Spotify proxy routes. Same default as TrackSearchInput.
const API_URL =
  (import.meta as any).env?.SANITY_STUDIO_SPOTIFY_API_URL || 'https://www.thatgoodsht.com'

// Good Sh*t Weekly always pulls from this one playlist.
const PLAYLIST_URL = 'https://open.spotify.com/playlist/67OMv1NpyxUTmUetPeTJ39'

const DEFAULT_INTRO = "We're back with another weekly roundup of good sh*t! This week we have:"
const DEFAULT_OUTRO = 'Dig through all our playlists here!'

// ── Types ──

interface SpotifyTrack {
  id?: string
  name: string
  artist: string
  art: string
  spotifyUrl?: string
}

interface TrackRow extends SpotifyTrack {
  key: string
  appleMusicUrl: string
  alignment: 'left' | 'right'
}

// ── Helpers ──

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

function keyFromTrack(track: SpotifyTrack, index: number) {
  return (track.id || `${track.name}-${track.artist}-${index}`)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12)
    .padEnd(8, `${index % 10}`)
}

// "2026-06-15" -> "6/15/26"
function dateToLabel(iso: string) {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(m)}/${Number(d)}/${y.slice(2)}`
}

function titleForDate(iso: string) {
  return `Good Sh*t Weekly ${dateToLabel(iso)}`
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function isValidAppleUrl(url: string) {
  const u = url.trim()
  return (
    !u ||
    u.includes('music.apple.com/us/song/') ||
    u.includes('music.apple.com/us/album/')
  )
}

function textBlock(text: string, key: string) {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', _key: `${key}s`, text, marks: []}],
  }
}

// Build the outro paragraph from editable text, linking the word "here" (if
// present) to the playlists page — matches the recurring roundup outro.
function buildOutroBlock(text: string) {
  const trimmed = text.trim()
  const idx = trimmed.toLowerCase().indexOf('here')
  if (idx === -1) {
    return {
      _type: 'block',
      _key: 'outro',
      style: 'normal',
      markDefs: [],
      children: [{_type: 'span', _key: 'outro1', text: trimmed, marks: []}],
    }
  }
  const before = trimmed.slice(0, idx)
  const linkText = trimmed.slice(idx, idx + 4) // preserve original casing of "here"
  const after = trimmed.slice(idx + 4)
  const children: unknown[] = []
  if (before) children.push({_type: 'span', _key: 'outro1', text: before, marks: []})
  children.push({_type: 'span', _key: 'outro2', text: linkText, marks: ['outrolink']})
  if (after) children.push({_type: 'span', _key: 'outro3', text: after, marks: []})
  return {
    _type: 'block',
    _key: 'outro',
    style: 'normal',
    markDefs: [{_type: 'link', _key: 'outrolink', href: 'https://www.thatgoodsht.com/playlists'}],
    children,
  }
}

// ── Styled ──

const Wrapper = styled.div`
  --text-primary: #000;
  --text-secondary: #666;
  --text-muted: #999;
  --bg-surface: #e0d5f0;
  --bg-neutral: #f5f5f5;
  --bg-input: #fff;
  --border-color: #e0e0e0;

  [data-scheme='dark'] & {
    --text-primary: #e8e8e8;
    --text-secondary: #aaa;
    --text-muted: #777;
    --bg-surface: #2a2640;
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

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

const Panel = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  background: var(--bg-neutral);
`

const Title = styled.h2`
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  font-weight: 700;
`

const Subtitle = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
`

const Field = styled.div`
  margin-bottom: 0.75rem;
`

const Label = styled.label`
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
`

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.45rem 0.6rem;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.85rem;
  font-family: inherit;
  background: var(--bg-input);
  color: var(--text-primary);
  outline: none;
  &:focus {
    border-color: #6c5cbe;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  padding: 0.45rem 0.6rem;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.85rem;
  font-family: inherit;
  background: var(--bg-input);
  color: var(--text-primary);
  outline: none;
  resize: vertical;
  &:focus {
    border-color: #6c5cbe;
  }
`

const Button = styled.button<{$variant?: 'primary' | 'apple' | 'ghost'; $active?: boolean}>`
  border: none;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  padding: 0.45rem 0.8rem;
  color: ${(p) => (p.$variant === 'ghost' && !p.$active ? 'var(--text-primary)' : '#fff')};
  background: ${(p) =>
    p.$variant === 'apple'
      ? '#fa233b'
      : p.$variant === 'ghost'
        ? p.$active
          ? '#6c5cbe'
          : 'var(--bg-surface)'
        : '#6c5cbe'};
  &:hover {
    opacity: 0.88;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`

const SubmitButton = styled(Button)`
  width: 100%;
  padding: 0.7rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`

const UploadRow = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
`

const Preview = styled.img<{$square?: boolean}>`
  height: 52px;
  width: ${(p) => (p.$square ? '52px' : '92px')};
  border-radius: 4px;
  object-fit: cover;
  background: var(--bg-surface);
  flex-shrink: 0;
`

const CoverPreview = styled.img`
  display: block;
  width: 100%;
  max-width: 220px;
  aspect-ratio: 1;
  border-radius: 6px;
  object-fit: cover;
  background: var(--bg-surface);
  margin-bottom: 0.5rem;
`

const Note = styled.div`
  margin-top: 0.5rem;
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

const TrackCard = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.55rem;
  margin-bottom: 0.5rem;
  background: var(--bg-input);
`

const TrackTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`

const Art = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
`

const TrackText = styled.button`
  flex: 1;
  min-width: 0;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: inherit;
`

const TrackName = styled.div`
  font-size: 0.83rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TrackArtist = styled.div`
  font-size: 0.72rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MiniBtn = styled.button`
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  color: var(--text-primary);
  border-radius: 4px;
  font-size: 0.72rem;
  font-family: inherit;
  padding: 0.2rem 0.4rem;
  cursor: pointer;
  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`

const AppleRow = styled.div`
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin-top: 0.5rem;
`

const Check = styled.span<{$ok: boolean}>`
  font-size: 0.85rem;
  color: ${(p) => (p.$ok ? '#15573b' : 'var(--text-muted)')};
  flex-shrink: 0;
`

// ── Component ──

export function WeeklyRoundupBuilder() {
  const client = useClient({apiVersion: '2024-04-01'})
  const router = useRouter()

  const [date, setDate] = useState(todayIso())
  const [title, setTitle] = useState(() => titleForDate(todayIso()))
  const [titleTouched, setTitleTouched] = useState(false)
  const [slug, setSlug] = useState(() => slugify(titleForDate(todayIso())))
  const [slugTouched, setSlugTouched] = useState(false)
  const [intro, setIntro] = useState(DEFAULT_INTRO)
  const [outro, setOutro] = useState(DEFAULT_OUTRO)
  const [tracks, setTracks] = useState<TrackRow[]>([])

  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [thumbPreview, setThumbPreview] = useState('')
  const [bannerPreview, setBannerPreview] = useState('')

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const didLoad = useRef(false)

  // Every loaded track is always included — no per-track selection anymore.
  const selected = tracks
  const trackNeedsApple = useCallback(
    (t: TrackRow) => !t.appleMusicUrl.trim() || !isValidAppleUrl(t.appleMusicUrl),
    [],
  )

  // Live validity used for both the dimmed-button state and the post-attempt
  // field highlighting (flags clear as the editor fills each field in).
  const invalid = useMemo(
    () => ({
      title: !title.trim(),
      slug: !slugify(slug),
      date: !date,
      tracks: selected.length === 0,
      banner: !bannerFile,
      apple: selected.filter(trackNeedsApple),
    }),
    [title, slug, date, selected, bannerFile, trackNeedsApple],
  )
  const formReady =
    !invalid.title &&
    !invalid.slug &&
    !invalid.date &&
    !invalid.tracks &&
    !invalid.banner &&
    invalid.apple.length === 0

  // Red highlight for a field, but only after a failed submit attempt.
  const errBorder = (bad: boolean) => (attempted && bad ? {borderColor: '#e74c3c'} : undefined)
  const errColor = (bad: boolean) => (attempted && bad ? {color: '#e74c3c'} : undefined)

  // Keep title in sync with the date until the editor types their own.
  useEffect(() => {
    if (!titleTouched) setTitle(titleForDate(date))
  }, [date, titleTouched])

  // Keep slug in sync with the title until the editor edits it directly.
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title))
  }, [title, slugTouched])

  const loadPlaylist = useCallback(async () => {
    setLoading(true)
    setError('')
    setStatus('')
    try {
      const res = await fetch(`${API_URL}/api/spotify/playlist?url=${encodeURIComponent(PLAYLIST_URL)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not load playlist.')

      const rows: TrackRow[] = (data.tracks || []).map((t: SpotifyTrack, i: number) => ({
        ...t,
        key: keyFromTrack(t, i),
        appleMusicUrl: '',
        // Alternate left/right by default; the editor can flip any row.
        alignment: i % 2 === 0 ? 'left' : 'right',
      }))
      setTracks(rows)
      if (data.playlist?.image && !thumbPreview) setThumbPreview(data.playlist.image)
    } catch (err: any) {
      setError(err.message || 'Could not load playlist.')
      setStatus('')
    } finally {
      setLoading(false)
    }
  }, [thumbPreview])

  useEffect(() => {
    if (didLoad.current) return
    didLoad.current = true
    loadPlaylist()
  }, [loadPlaylist])

  const patchTrack = useCallback((key: string, patch: Partial<TrackRow>) => {
    setTracks((cur) => cur.map((t) => (t.key === key ? {...t, ...patch} : t)))
  }, [])

  const openAppleSearch = useCallback((track: TrackRow) => {
    const term = encodeURIComponent(`${track.name} ${track.artist}`)
    window.open(`https://music.apple.com/us/search?term=${term}`, '_blank')
  }, [])

  const onPickThumb = useCallback((file: File | null) => {
    setThumbFile(file)
    if (file) setThumbPreview(URL.createObjectURL(file))
  }, [])

  const onPickBanner = useCallback((file: File | null) => {
    setBannerFile(file)
    if (file) setBannerPreview(URL.createObjectURL(file))
  }, [])

  const imageField = (assetId: string) => ({
    _type: 'image' as const,
    asset: {_type: 'reference' as const, _ref: assetId},
  })

  const buildContent = useCallback(() => {
    const blocks: unknown[] = []
    if (intro.trim()) blocks.push(textBlock(intro.trim(), 'intro'))

    selected.forEach((track, index) => {
      blocks.push({
        _type: 'trackEmbed',
        _key: `track${track.key}${index}`,
        spotifyUrl: track.spotifyUrl,
        ...(track.appleMusicUrl.trim() ? {appleMusicUrl: track.appleMusicUrl.trim()} : {}),
        trackName: track.name,
        artistName: track.artist,
        albumArt: track.art,
        alignment: track.alignment,
      })
    })

    if (outro.trim()) blocks.push(buildOutroBlock(outro))
    return blocks
  }, [intro, outro, selected])

  const createDraft = useCallback(async () => {
    setError('')
    setStatus('')
    setAttempted(true)

    // Tracks load automatically on open — if none are here the fetch failed.
    if (invalid.tracks) {
      setError('Couldn’t load the playlist — refresh the page to try again.')
      return
    }

    // Collect every missing field so the editor can fix them in one pass.
    const problems: string[] = []
    if (invalid.title) problems.push('Title')
    if (invalid.slug) problems.push('Slug')
    if (invalid.date) problems.push('Date')
    if (invalid.banner) problems.push('Banner')
    if (invalid.apple.length) {
      problems.push(
        `Apple Music link (${invalid.apple.length} track${invalid.apple.length > 1 ? 's' : ''})`,
      )
    }
    if (problems.length) {
      setError(`Fill in: ${problems.join(', ')}.`)
      return
    }

    const cleanSlug = slugify(slug)
    setSubmitting(true)
    try {
      // 1. Upload images.
      setStatus('Uploading images…')
      let thumb
      if (thumbFile) {
        const asset = await client.assets.upload('image', thumbFile, {filename: `${cleanSlug}-thumb`})
        thumb = imageField(asset._id)
      } else if (thumbPreview) {
        // Fall back to the playlist cover art if no custom thumbnail was picked.
        const blob = await (await fetch(thumbPreview)).blob()
        const asset = await client.assets.upload('image', blob, {filename: `${cleanSlug}-thumb`})
        thumb = imageField(asset._id)
      }

      let banner
      if (bannerFile) {
        const asset = await client.assets.upload('image', bannerFile, {filename: `${cleanSlug}-banner`})
        banner = imageField(asset._id)
      }

      // 2. Create the draft post.
      setStatus('Creating draft post…')
      const baseId = `playlist-blog-${cleanSlug}`
      await client.createOrReplace({
        _id: `drafts.${baseId}`,
        _type: 'post',
        name: title.trim(),
        slug: {_type: 'slug', current: cleanSlug},
        date,
        private: true,
        weekly: true,
        content: buildContent(),
        ...(thumb ? {thumb} : {}),
        ...(banner ? {banner} : {}),
      })

      // 3. Sync the thumbnail onto the site playlist (matched by Spotify URL).
      if (thumb) {
        setStatus('Updating playlist cover…')
        const playlistId = '67OMv1NpyxUTmUetPeTJ39'
        const docs: {_id: string}[] = await client.fetch(
          `*[_type == "playlist" && playlistURL match $m]{_id}`,
          {m: `*${playlistId}*`},
        )
        if (docs.length) {
          const tx = client.transaction()
          docs.forEach((d) => tx.patch(d._id, (p) => p.set({thumb})))
          await tx.commit()
        }
      }

      setStatus('Draft created — opening…')
      router.navigateIntent('edit', {id: baseId, type: 'post'})
    } catch (err: any) {
      setError(err.message || 'Could not create the draft.')
      setStatus('')
    } finally {
      setSubmitting(false)
    }
  }, [
    invalid,
    title,
    slug,
    date,
    thumbFile,
    thumbPreview,
    bannerFile,
    buildContent,
    client,
    router,
  ])

  return (
    <Wrapper>
      <Title>New Good Sh*t Weekly</Title>

      <Layout>
        {/* ── Left: post settings ── */}
        <Panel>
          <Field>
            <Label style={errColor(invalid.date)}>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={errBorder(invalid.date)}
            />
          </Field>
          <Field>
            <Label style={errColor(invalid.title)}>Title</Label>
            <Input
              value={title}
              onChange={(e) => {
                setTitleTouched(true)
                setTitle(e.target.value)
              }}
              style={errBorder(invalid.title)}
            />
          </Field>
          <Field>
            <Label style={errColor(invalid.slug)}>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))
              }}
              onBlur={() => setSlug((s) => slugify(s))}
              style={errBorder(invalid.slug)}
            />
          </Field>
          <Field>
            <Label>Intro</Label>
            <TextArea rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} />
          </Field>
          <Field>
            <Label>Outro ("here" links to /playlists)</Label>
            <TextArea rows={2} value={outro} onChange={(e) => setOutro(e.target.value)} />
          </Field>

          <Field>
            <Label>Thumbnail — defaults to the Spotify cover, upload to override</Label>
            {thumbPreview && <CoverPreview src={thumbPreview} alt="" />}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPickThumb(e.target.files?.[0] || null)}
              style={{fontSize: '0.75rem'}}
            />
          </Field>
          <Field>
            <Label style={errColor(invalid.banner)}>Banner (16:9)</Label>
            <UploadRow>
              {bannerPreview && <Preview src={bannerPreview} alt="" />}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onPickBanner(e.target.files?.[0] || null)}
                style={{fontSize: '0.75rem'}}
              />
            </UploadRow>
          </Field>

          <SubmitButton
            onClick={createDraft}
            disabled={submitting}
            style={{opacity: formReady ? 1 : 0.55}}
          >
            {submitting ? 'Working…' : 'Create draft + update playlist'}
          </SubmitButton>

          {(error || status) && (
            <Note data-kind={error ? 'error' : 'ok'}>{error || status}</Note>
          )}
        </Panel>

        {/* ── Right: tracks ── */}
        <Panel>
          {loading && (
            <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
              Loading playlist…
            </div>
          )}

          {tracks.length === 0 && !loading && (
            <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
              Couldn’t load the playlist — refresh the page to try again.
            </div>
          )}

          {tracks.map((track) => {
            const appleOk = Boolean(track.appleMusicUrl.trim()) && isValidAppleUrl(track.appleMusicUrl)
            return (
              <TrackCard key={track.key} style={errBorder(!appleOk)}>
                <TrackTop>
                  {track.art ? <Art src={track.art} alt="" /> : <Art as="div" />}
                  <TrackText as="div">
                    <TrackName>{track.name}</TrackName>
                    <TrackArtist>{track.artist}</TrackArtist>
                  </TrackText>
                </TrackTop>

                <AppleRow>
                  <Button type="button" $variant="apple" onClick={() => openAppleSearch(track)}>
                    Search Apple
                  </Button>
                  <MiniBtn
                    type="button"
                    title="Paste from clipboard"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText()
                        patchTrack(track.key, {appleMusicUrl: text})
                      } catch {
                        /* clipboard blocked — editor can paste manually */
                      }
                    }}
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                  </MiniBtn>
                  <Input
                    value={track.appleMusicUrl}
                    onChange={(e) => patchTrack(track.key, {appleMusicUrl: e.target.value})}
                    placeholder="Paste music.apple.com/us/song/… link"
                    style={{flex: 1, ...errBorder(!appleOk)}}
                  />
                  <Check $ok={appleOk}>{appleOk ? '✓' : '○'}</Check>
                </AppleRow>
              </TrackCard>
            )
          })}
        </Panel>
      </Layout>
    </Wrapper>
  )
}
