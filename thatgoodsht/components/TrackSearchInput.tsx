import {useState, useCallback, useEffect, useRef} from 'react'
import {set, unset} from 'sanity'
import styled from 'styled-components'

const API_URL =
  (import.meta as any).env?.SANITY_STUDIO_SPOTIFY_API_URL || 'https://www.thatgoodsht.com'

// ── Styled Components ──

const Wrapper = styled.div`
  --text-primary: #222;
  --text-secondary: #666;
  --text-muted: #999;
  --text-label: #555;
  --bg-surface: #f3f1fa;
  --bg-neutral: #fafafa;
  --bg-input: #fff;
  --bg-inactive: #f0f0f0;
  --bg-inactive-hover: #e0e0e0;
  --border-color: #ddd;
  --border-divider: #d0d0d0;

  [data-scheme='dark'] & {
    --text-primary: #e8e8e8;
    --text-secondary: #aaa;
    --text-muted: #777;
    --text-label: #bbb;
    --bg-surface: #2a2640;
    --bg-neutral: #1e1e2e;
    --bg-input: #1e1e2e;
    --bg-inactive: #2a2a3d;
    --bg-inactive-hover: #353548;
    --border-color: #444;
    --border-divider: #444;
  }

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const ActionButton = styled.button<{$variant?: 'primary' | 'danger' | 'secondary'}>`
  padding: 0.4rem 3rem;
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
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`

const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
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
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`

const DialogBody = styled.div`
  padding: 1.25rem;
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

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.75rem;
`

const ResultRow = styled.button<{$selected: boolean}>`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  padding: 0.5rem;
  border-radius: 5px;
  border: 2px solid ${(p) => (p.$selected ? '#6c5cbe' : 'transparent')};
  background: ${(p) => (p.$selected ? 'var(--bg-surface)' : 'var(--bg-neutral)')};
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  width: 100%;
  &:hover {
    background: var(--bg-surface);
  }
`

const SpinnerDot = styled.div`
  width: 3px;
  height: 3px;
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
  margin-bottom: 0.75rem;
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

const SearchToggle = styled.div`
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
`

const SearchToggleButton = styled.button<{$active: boolean}>`
  background: ${(p) => (p.$active ? '#6c5cbe' : 'var(--bg-inactive)')};
  border: none;
  color: ${(p) => (p.$active ? '#fff' : 'var(--text-primary)')};
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-family: inherit;
  &:hover {
    background: ${(p) => (p.$active ? '#6c5cbe' : 'var(--bg-inactive-hover)')};
  }
  & + & {
    border-left: 1px solid var(--border-divider);
  }
`

// ── Types ──

interface SpotifyTrack {
  id: string
  name: string
  artists: string
  albumArt: string
  spotifyUrl: string
}

type Step = 'search' | 'apple'
type SearchType = 'track' | 'album'

// ── Component ──

export function TrackSearchInput(props: any) {
  const {value, onChange} = props

  const [step, setStep] = useState<Step>('search')
  const [editing, setEditing] = useState(false)
  const [searchType, setSearchType] = useState<SearchType>('track')

  // Search state
  const [trackQuery, setTrackQuery] = useState('')
  const [artistQuery, setArtistQuery] = useState('')
  const [results, setResults] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<SpotifyTrack | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Apple Music state
  const [appleMusicUrl, setAppleMusicUrl] = useState('')

  // Heading / subheading / alignment state
  const [heading, setHeading] = useState('')
  const [subheading, setSubheading] = useState('')
  const [alignment, setAlignment] = useState<'left' | 'right'>(value?.alignment || 'left')

  const hasValue = value?.trackName

  // Auto-enter apple step when a track is already saved
  useEffect(() => {
    if (hasValue && !editing) {
      startEditing('apple')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus search input when the search step is shown
  useEffect(() => {
    if (step === 'search') {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [step])

  // Debounced search
  useEffect(() => {
    if (!trackQuery.trim()) {
      setResults([])
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      const prefix = searchType === 'track' ? 'track' : 'album'
      const q = artistQuery.trim()
        ? `${prefix}:${trackQuery.trim()} artist:${artistQuery.trim()}`
        : trackQuery.trim()
      setLoading(true)
      try {
        const res = await fetch(
          `${API_URL}/api/spotify/search?q=${encodeURIComponent(q)}&type=${searchType}`,
        )
        const data = await res.json()
        setResults(data.tracks || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [trackQuery, artistQuery, searchType])

  const startEditing = useCallback(
    (toStep: Step) => {
      setSelected({
        id: '',
        name: value?.trackName || '',
        artists: value?.artistName || '',
        albumArt: value?.albumArt || '',
        spotifyUrl: value?.spotifyUrl || '',
      })
      setAppleMusicUrl(value?.appleMusicUrl || '')
      setHeading(value?.heading || '')
      setSubheading(value?.subheading || '')
      setAlignment(value?.alignment || 'left')
      setStep(toStep)
      setEditing(true)
    },
    [value],
  )

  const confirmTrack = useCallback(() => {
    if (!selected) return

    onChange(set(selected.spotifyUrl, ['spotifyUrl']))
    onChange(set(selected.name, ['trackName']))
    onChange(set(selected.artists, ['artistName']))
    onChange(set(selected.albumArt, ['albumArt']))

    if (appleMusicUrl.trim()) {
      onChange(set(appleMusicUrl.trim(), ['appleMusicUrl']))
    } else {
      onChange(unset(['appleMusicUrl']))
    }

    if (heading.trim()) {
      onChange(set(heading.trim(), ['heading']))
    } else {
      onChange(unset(['heading']))
    }

    if (subheading.trim()) {
      onChange(set(subheading.trim(), ['subheading']))
    } else {
      onChange(unset(['subheading']))
    }

    onChange(set(alignment, ['alignment']))

    // Close the block editor modal by clicking the dialog's X button
    setTimeout(() => {
      const dialog = document.querySelector('[data-testid="default-edit-object-dialog"]')
      const closeBtn =
        dialog?.querySelector<HTMLButtonElement>('button[aria-label="Close dialog"]') ||
        dialog?.querySelector<HTMLButtonElement>('button[aria-label="Close"]')
      if (closeBtn) {
        closeBtn.click()
      } else {
        props.onPathFocus?.([])
      }
    }, 0)
  }, [selected, appleMusicUrl, heading, subheading, alignment, onChange, props])

  const isValidAppleUrl =
    !appleMusicUrl.trim() ||
    appleMusicUrl.includes('music.apple.com/us/song/') ||
    appleMusicUrl.includes('music.apple.com/us/album/')

  const openAppleSearch = useCallback(() => {
    if (!selected) return
    const term = encodeURIComponent(`${selected.name} - ${selected.artists}`)
    window.open(`https://music.apple.com/us/search?term=${term}`, '_blank')
  }, [selected])

  return (
    <Wrapper>
      <DialogBody>
        {/* ── Step 1: Search ── */}
        {step === 'search' && (
          <>
            <div style={{display: 'flex', gap: '0.75rem', marginBottom: '0.75rem'}}>
              <SearchToggle style={{marginBottom: 0}}>
                <SearchToggleButton
                  type="button"
                  $active={searchType === 'track'}
                  onClick={() => {
                    setSearchType('track')
                    setResults([])
                    setSelected(null)
                  }}
                >
                  Song
                </SearchToggleButton>
                <SearchToggleButton
                  type="button"
                  $active={searchType === 'album'}
                  onClick={() => {
                    setSearchType('album')
                    setResults([])
                    setSelected(null)
                  }}
                >
                  Album
                </SearchToggleButton>
              </SearchToggle>
              <SearchToggle style={{marginBottom: 0}}>
                <SearchToggleButton
                  type="button"
                  $active={alignment === 'left'}
                  onClick={() => setAlignment('left')}
                >
                  Left
                </SearchToggleButton>
                <SearchToggleButton
                  type="button"
                  $active={alignment === 'right'}
                  onClick={() => setAlignment('right')}
                >
                  Right
                </SearchToggleButton>
              </SearchToggle>
            </div>
            <FieldGroup>
              <FieldLabel>{searchType === 'track' ? 'Song' : 'Album'}</FieldLabel>
              <Input
                ref={searchInputRef}
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder={searchType === 'track' ? 'e.g. Automatic' : 'e.g. Purity'}
              />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Filter by Artist</FieldLabel>
              <Input
                value={artistQuery}
                onChange={(e) => setArtistQuery(e.target.value)}
                placeholder="e.g. Anysia Kim, Tony Seltzer"
              />
            </FieldGroup>

            {loading && (
              <div style={{display: 'flex', gap: '4px', padding: '0.5rem 0'}}>
                <SpinnerDot style={{animationDelay: '0s'}} />
                <SpinnerDot style={{animationDelay: '0.2s'}} />
                <SpinnerDot style={{animationDelay: '0.4s'}} />
              </div>
            )}

            {results.length > 0 && (
              <ResultsList>
                {results.map((track) => (
                  <ResultRow
                    key={track.id}
                    type="button"
                    $selected={selected?.id === track.id}
                    onClick={() => {
                      setSelected(track)
                      setStep('apple')
                    }}
                  >
                    {track.albumArt && (
                      <AlbumArt src={track.albumArt} alt="" style={{width: 40, height: 40}} />
                    )}
                    <TrackInfo>
                      <TrackName>{track.name}</TrackName>
                      <ArtistName>{track.artists}</ArtistName>
                    </TrackInfo>
                  </ResultRow>
                ))}
              </ResultsList>
            )}

            <div style={{marginTop: '1rem', textAlign: 'right'}}>
              <ActionButton type="button" disabled={!selected} onClick={() => setStep('apple')}>
                Apple Music →
              </ActionButton>
            </div>
          </>
        )}

        {/* ── Step 2: Apple Music + Heading/Subheading + Save ── */}
        {step === 'apple' && selected && (
          <>
            <FieldLabel>Spotify</FieldLabel>
            <PreviewCard style={{marginBottom: '0.75rem', border: '2px solid #1DB954'}}>
              {selected.albumArt && <AlbumArt src={selected.albumArt} alt="" />}
              <TrackInfo>
                <TrackName>{selected.name}</TrackName>
                <ArtistName>{selected.artists}</ArtistName>
              </TrackInfo>
            </PreviewCard>

            <FieldGroup>
              <FieldLabel>Apple Music Link</FieldLabel>
              <div style={{display: 'flex'}}>
                <ActionButton
                  type="button"
                  style={{
                    marginRight: '0.5rem',
                    background: '#FA233B',
                    whiteSpace: 'nowrap',
                    padding: '0.4rem 2.2rem',
                  }}
                  onClick={openAppleSearch}
                >
                  Search Apple Music
                </ActionButton>
                <div style={{position: 'relative', flex: 1}}>
                  <Input
                    value={appleMusicUrl}
                    onChange={(e) => setAppleMusicUrl(e.target.value)}
                    placeholder={
                      searchType === 'album'
                        ? 'https://music.apple.com/us/album/...'
                        : 'https://music.apple.com/us/song/...'
                    }
                    style={{paddingLeft: '2rem'}}
                  />
                  <button
                    type="button"
                    title="Paste from clipboard"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText()
                        setAppleMusicUrl(text)
                      } catch {}
                    }}
                    style={{
                      position: 'absolute',
                      left: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: '0.2rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      lineHeight: 1,
                    }}
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
                  </button>
                </div>
              </div>
              {appleMusicUrl && !isValidAppleUrl && (
                <HelpText style={{color: '#e74c3c'}}>
                  {searchType === 'album' ? 'Album' : 'Song'} link must be copied from Apple Music.
                </HelpText>
              )}
            </FieldGroup>

            <div style={{display: 'flex', gap: '0.75rem'}}>
              <FieldGroup style={{flex: 1}}>
                <FieldLabel>Title</FieldLabel>
                <Input
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder={selected.name}
                />
              </FieldGroup>
              <FieldGroup style={{flex: 1}}>
                <FieldLabel>Subtitle</FieldLabel>
                <Input
                  value={subheading}
                  onChange={(e) => setSubheading(e.target.value)}
                  placeholder={selected.artists}
                />
              </FieldGroup>
            </div>

            <ButtonRow style={{marginTop: '1rem', justifyContent: 'space-between'}}>
              <ActionButton type="button" $variant="secondary" onClick={() => setStep('search')}>
                ← Change Song
              </ActionButton>
              <ButtonRow>
                <SearchToggle style={{marginBottom: 0}}>
                  <SearchToggleButton
                    type="button"
                    $active={alignment === 'left'}
                    onClick={() => setAlignment('left')}
                  >
                    Left
                  </SearchToggleButton>
                  <SearchToggleButton
                    type="button"
                    $active={alignment === 'right'}
                    onClick={() => setAlignment('right')}
                  >
                    Right
                  </SearchToggleButton>
                </SearchToggle>
                <ActionButton
                  type="button"
                  disabled={!isValidAppleUrl || appleMusicUrl === ''}
                  onClick={confirmTrack}
                >
                  Save
                </ActionButton>
              </ButtonRow>
            </ButtonRow>
          </>
        )}
      </DialogBody>
    </Wrapper>
  )
}
