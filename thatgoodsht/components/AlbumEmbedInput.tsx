import {useState, useCallback, useEffect, useRef} from 'react'
import {set, unset, setIfMissing} from 'sanity'
import styled from 'styled-components'

/**
 * Custom input for the post's `albumEmbed` object field. Search Spotify for the
 * album, select it, then jump to Apple Music (prefilled search) and paste the
 * album link — the same flow as the blog editor's TrackSearchInput, scoped to
 * the two URLs the album card needs (spotifyUrl + appleMusicUrl).
 */

const API_URL =
  (import.meta as any).env?.SANITY_STUDIO_SPOTIFY_API_URL || 'https://www.thatgoodsht.com'

interface AlbumResult {
  id: string
  name: string
  artists: string
  albumArt: string
  spotifyUrl: string
}

type Value = {
  spotifyUrl?: string
  appleMusicUrl?: string
  albumName?: string
  albumArtist?: string
  albumArt?: string
}

export function AlbumEmbedInput(props: any) {
  const {value, onChange} = props as {value?: Value; onChange: (patch: any) => void}

  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AlbumResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<AlbumResult | null>(null)
  const [appleUrl, setAppleUrl] = useState('')
  // Fallback metadata for legacy entries that only stored URLs (no cached card).
  const [fetchedMeta, setFetchedMeta] = useState<{
    name: string
    artist: string
    image: string | null
  } | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Debounced Spotify album search.
  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `${API_URL}/api/spotify/search?q=${encodeURIComponent(q)}&type=album`,
        )
        const data = await res.json()
        setResults(data.tracks || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (editing) setTimeout(() => searchRef.current?.focus(), 50)
  }, [editing])

  // Legacy entries stored only URLs — fetch name/art so the card still renders.
  useEffect(() => {
    if (editing || value?.albumName || !value?.spotifyUrl) return
    let cancelled = false
    fetch(`${API_URL}/api/spotify/album?url=${encodeURIComponent(value.spotifyUrl)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d && !d.error) setFetchedMeta(d)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [editing, value?.spotifyUrl, value?.albumName])

  const isValidApple =
    !appleUrl.trim() || (appleUrl.includes('music.apple.com') && appleUrl.includes('/album/'))

  const openAppleSearch = useCallback(() => {
    if (!selected) return
    const term = encodeURIComponent(`${selected.name} - ${selected.artists}`)
    window.open(`https://music.apple.com/us/search?term=${term}`, '_blank')
  }, [selected])

  const pickAlbum = useCallback(
    (album: AlbumResult) => {
      setSelected(album)
      onChange([
        setIfMissing({}),
        set(album.spotifyUrl, ['spotifyUrl']),
        set(album.name, ['albumName']),
        set(album.artists, ['albumArtist']),
        set(album.albumArt, ['albumArt']),
      ])
    },
    [onChange],
  )

  const saveApple = useCallback(
    (url: string) => {
      setAppleUrl(url)
      const trimmed = url.trim()
      onChange(trimmed ? set(trimmed, ['appleMusicUrl']) : unset(['appleMusicUrl']))
    },
    [onChange],
  )

  const clearAll = useCallback(() => {
    setSelected(null)
    setAppleUrl('')
    setQuery('')
    setResults([])
    onChange(unset())
    setEditing(false)
  }, [onChange])

  const startEditing = useCallback(() => {
    setAppleUrl(value?.appleMusicUrl || '')
    setSelected(null)
    setEditing(true)
  }, [value])

  // ── Saved summary (collapsed): an album card like the search results ──
  if (!editing && (value?.spotifyUrl || value?.appleMusicUrl)) {
    const art = value?.albumArt || fetchedMeta?.image || ''
    const title = value?.albumName || fetchedMeta?.name || 'Album'
    const artist = value?.albumArtist || fetchedMeta?.artist || ''
    return (
      <Wrapper>
        <SummaryCard>
          {art && <AlbumArt src={art} alt="" style={{cursor: 'pointer'}} onClick={startEditing} />}
          <TrackInfo style={{cursor: 'pointer'}} onClick={startEditing}>
            <TrackName>{title}</TrackName>
            <ArtistName>{artist}</ArtistName>
          </TrackInfo>
          <ButtonRow>
            {value?.spotifyUrl && (
              <ActionButton
                as="a"
                href={value.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                title="Open in Spotify"
                style={{background: '#1db954', padding: '0.4rem 0.8rem'}}
              >
                <SpotifyIcon />
              </ActionButton>
            )}
            {value?.appleMusicUrl && (
              <ActionButton
                as="a"
                href={value.appleMusicUrl}
                target="_blank"
                rel="noreferrer"
                title="Open in Apple Music"
                style={{background: '#fa233b', padding: '0.4rem 0.8rem'}}
              >
                <AppleMusicIcon />
              </ActionButton>
            )}
            <ActionButton type="button" $variant="danger" onClick={clearAll}>
              Clear
            </ActionButton>
          </ButtonRow>
        </SummaryCard>
      </Wrapper>
    )
  }

  // ── Editor ──
  return (
    <Wrapper>
      <FieldGroup>
        <Input
          ref={searchRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Pinball II"
          onFocus={() => setEditing(true)}
        />
      </FieldGroup>

      {loading && (
        <div style={{display: 'flex', gap: 4, padding: '0.25rem 0'}}>
          <SpinnerDot style={{animationDelay: '0s'}} />
          <SpinnerDot style={{animationDelay: '0.2s'}} />
          <SpinnerDot style={{animationDelay: '0.4s'}} />
        </div>
      )}

      {results.length > 0 && !selected && (
        <ResultsList>
          {results.map((album) => (
            <ResultRow key={album.id} type="button" onClick={() => pickAlbum(album)}>
              {album.albumArt && <AlbumArt src={album.albumArt} alt="" />}
              <TrackInfo>
                <TrackName>{album.name}</TrackName>
                <ArtistName>{album.artists}</ArtistName>
              </TrackInfo>
            </ResultRow>
          ))}
        </ResultsList>
      )}

      {selected && (
        <>
          <FieldLabel style={{marginTop: '0.75rem'}}>Spotify</FieldLabel>
          <PreviewCard>
            {selected.albumArt && <AlbumArt src={selected.albumArt} alt="" />}
            <TrackInfo>
              <TrackName>{selected.name}</TrackName>
              <ArtistName>{selected.artists}</ArtistName>
            </TrackInfo>
          </PreviewCard>

          <FieldGroup style={{marginTop: '0.75rem'}}>
            <FieldLabel>Apple Music</FieldLabel>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <ActionButton
                type="button"
                style={{background: '#fa233b', whiteSpace: 'nowrap', padding: '0.4rem 1.4rem'}}
                onClick={openAppleSearch}
              >
                Search Apple Music
              </ActionButton>
              <div style={{position: 'relative', flex: 1}}>
                <Input
                  value={appleUrl}
                  onChange={(e) => saveApple(e.target.value)}
                  placeholder="music.apple.com/us/album/..."
                  style={{paddingLeft: '2rem'}}
                />
                <PasteButton
                  type="button"
                  title="Paste from clipboard"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText()
                      if (text) saveApple(text.trim())
                    } catch {
                      /* clipboard blocked */
                    }
                  }}
                >
                  <ClipboardIcon />
                </PasteButton>
              </div>
            </div>
            {appleUrl && !isValidApple && (
              <HelpText style={{color: '#e74c3c'}}>
                Link must be an Apple Music album URL (music.apple.com/…/album/…).
              </HelpText>
            )}
          </FieldGroup>

          <ButtonRow style={{marginTop: '0.5rem'}}>
            <ActionButton
              type="button"
              $variant="secondary"
              onClick={() => {
                setSelected(null)
                setQuery('')
              }}
            >
              Back
            </ActionButton>
            <ActionButton
              type="button"
              style={{marginLeft: 'auto'}}
              onClick={() => setEditing(false)}
            >
              Save
            </ActionButton>
          </ButtonRow>
        </>
      )}
    </Wrapper>
  )
}

function SpotifyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="#fff"
      aria-hidden
      style={{transform: 'translateY(2px)'}}
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

function AppleMusicIcon() {
  // Beamed (joined) pair of eighth notes ♫
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="#fff"
      aria-hidden
      style={{transform: 'translateY(2px)'}}
    >
      <rect x="8.4" y="5" width="1.5" height="12.6" rx="0.75" />
      <rect x="18" y="3" width="1.5" height="13.6" rx="0.75" />
      <path d="M8.4 4.4 L19.5 2.4 L19.5 5.2 L8.4 7.2 Z" />
      <ellipse cx="6.4" cy="17.6" rx="3" ry="2.2" />
      <ellipse cx="16" cy="16.6" rx="3" ry="2.2" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  )
}

/* ── styled ── */

const Wrapper = styled.div`
  --text-primary: #222;
  --text-secondary: #666;
  --text-muted: #999;
  --text-label: #555;
  --bg-surface: #f3f1fa;
  --bg-neutral: #fafafa;
  --bg-input: #fff;
  --border-color: #ddd;

  [data-scheme='dark'] & {
    --text-primary: #e8e8e8;
    --text-secondary: #aaa;
    --text-muted: #777;
    --text-label: #bbb;
    --bg-surface: #2a2640;
    --bg-neutral: #1e1e2e;
    --bg-input: #1e1e2e;
    --border-color: #444;
  }

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const ActionButton = styled.button<{$variant?: 'danger' | 'secondary'}>`
  padding: 0.4rem 1.4rem;
  border-radius: 4px;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  background: ${(p) =>
    p.$variant === 'danger' ? '#e74c3c' : p.$variant === 'secondary' ? '#888' : '#6c5cbe'};
  color: #fff;
  &:hover {
    opacity: 0.85;
  }
`

const ButtonRow = styled.div`
  display: flex;
  gap: 0.4rem;
  align-items: center;
`

const SummaryCard = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  border-radius: 6px;
  background: var(--bg-surface);
`

const PreviewCard = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.6rem;
  border-radius: 6px;
  background: var(--bg-surface);
`

const AlbumArt = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
`

const TrackInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const TrackName = styled.div`
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ArtistName = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
  background: var(--bg-input);
  color: var(--text-primary);
  &:focus {
    border: 2px solid #6c5cbe;
  }
`

const PasteButton = styled.button`
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.2rem;
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
`

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`

const ResultRow = styled.button`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  padding: 0.5rem;
  border-radius: 5px;
  border: 2px solid transparent;
  background: var(--bg-neutral);
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  width: 100%;
  &:hover {
    background: var(--bg-surface);
  }
`

const SpinnerDot = styled.div`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #6c5cbe;
  animation: pulse 0.8s infinite alternate;
  @keyframes pulse {
    from {
      opacity: 0.3;
    }
    to {
      opacity: 1;
    }
  }
`

const FieldGroup = styled.div`
  margin-bottom: 0.25rem;
`

const FieldLabel = styled.label`
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-label);
  margin-bottom: 0.25rem;
`

const HelpText = styled.div`
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
`
