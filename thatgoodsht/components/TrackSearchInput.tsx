import {useState, useCallback, useEffect, useRef} from 'react'
import {set, unset} from 'sanity'
import styled from 'styled-components'

const API_URL = (import.meta as any).env?.SANITY_STUDIO_SPOTIFY_API_URL || 'https://thatgoodsht.com'

// ── Styled Components ──

const Wrapper = styled.div`
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
  background: #f3f1fa;
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
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ArtistName = styled.div`
  font-size: 0.75rem;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`

const DialogBody = styled.div`
  padding: 1.25rem;
`

const StepLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
`

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
  &:focus {
    border: 2px solid #6c5cbe;
  }
`

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  outline: none;
  resize: vertical;
  min-height: 60px;
  box-sizing: border-box;
  &:focus {
    border-color: #6c5cbe;
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
  background: ${(p) => (p.$selected ? '#f3f1fa' : '#fafafa')};
  cursor: pointer;
  text-align: left;
  width: 100%;
  &:hover {
    background: #f3f1fa;
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
  color: #555;
  margin-bottom: 0.25rem;
`

const HelpText = styled.div`
  font-size: 0.72rem;
  color: #999;
  margin-top: 0.25rem;
`

const SearchToggle = styled.div`
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
`

const SearchToggleButton = styled.button<{$active: boolean}>`
  background: ${(p) => (p.$active ? '#6c5cbe' : '#f0f0f0')};
  border: none;
  color: ${(p) => (p.$active ? '#fff' : '#000')};
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-family: inherit;
  &:hover {
    background: ${(p) => (p.$active ? '#6c5cbe' : '#e0e0e0')};
  }
  & + & {
    border-left: 1px solid #d0d0d0;
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

type Step = 'search' | 'apple' | 'editorial'
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

  // Apple Music state
  const [appleMusicUrl, setAppleMusicUrl] = useState('')

  // Editorial state
  const [title, setTitle] = useState('')
  const [blurb, setBlurb] = useState('')
  const [alignment, setAlignment] = useState<'left' | 'right'>(value?.alignment || 'left')

  const hasValue = value?.trackName

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
      setTitle(value?.title || '')
      setBlurb(value?.blurb || '')
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

    if (title.trim()) {
      onChange(set(title.trim(), ['title']))
    } else {
      onChange(unset(['title']))
    }

    if (blurb.trim()) {
      onChange(set(blurb.trim(), ['blurb']))
    } else {
      onChange(unset(['blurb']))
    }

    onChange(set(alignment, ['alignment']))

    setEditing(false)
  }, [selected, appleMusicUrl, title, blurb, alignment, onChange])

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
      {hasValue && !editing ? (
        <>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexDirection: (value.alignment || 'left') === 'right' ? 'row-reverse' : 'row'}}>
            {value.albumArt && <AlbumArt src={value.albumArt} alt="" />}
            <div style={{flex: 1, minWidth: 0, textAlign: (value.alignment || 'left') === 'right' ? 'right' : 'left'}}>
              <div style={{fontWeight: 600, fontSize: '0.85rem', color: '#222'}}>
                {value.title || `${value.trackName} – ${value.artistName}`}
              </div>
              {value.blurb && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#666',
                    marginTop: '0.25rem',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {value.blurb}
                </div>
              )}
            </div>
          </div>
          <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem'}}>
            <SearchToggle style={{marginBottom: 0}}>
            <SearchToggleButton
              type="button"
              $active={(value.alignment || 'left') === 'left'}
              onClick={() => onChange(set('left', ['alignment']))}
            >
              Left
            </SearchToggleButton>
            <SearchToggleButton
              type="button"
              $active={(value.alignment || 'left') === 'right'}
              onClick={() => onChange(set('right', ['alignment']))}
            >
              Right
            </SearchToggleButton>
          </SearchToggle>
            <ActionButton
              type="button"
              onClick={() => startEditing('editorial')}
              style={{padding: '0.35rem 0.6rem', fontSize: '0.72rem'}}
            >
              Edit
            </ActionButton>
          </div>
        </>
      ) : (
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
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder={searchType === 'track' ? 'e.g. Automatic' : 'e.g. Purity'}
                  autoFocus
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

          {/* ── Step 2: Apple Music ── */}
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
                <FieldLabel>Apple Music</FieldLabel>
                <div style={{display: 'flex'}}>
                  <ActionButton
                    type="button"
                    style={{marginRight: '0.5rem', background: '#FA233B'}}
                    onClick={openAppleSearch}
                  >
                    Search
                  </ActionButton>
                  <Input
                    value={appleMusicUrl}
                    onChange={(e) => setAppleMusicUrl(e.target.value)}
                    placeholder={
                      searchType === 'album'
                        ? 'https://music.apple.com/us/album/...'
                        : 'https://music.apple.com/us/song/...'
                    }
                  />
                </div>
                {appleMusicUrl && !isValidAppleUrl && (
                  <HelpText style={{color: '#e74c3c'}}>
                    {searchType === 'album' ? 'Album' : 'Song'} link must be copied from Apple
                    Music.
                  </HelpText>
                )}
              </FieldGroup>

              <ButtonRow style={{marginTop: '1rem', justifyContent: 'space-between'}}>
                <ActionButton type="button" $variant="secondary" onClick={() => setStep('search')}>
                  ← Change Song
                </ActionButton>
                <ButtonRow>
                  <ActionButton
                    type="button"
                    disabled={!isValidAppleUrl || appleMusicUrl === ''}
                    onClick={() => setStep('editorial')}
                  >
                    Write →
                  </ActionButton>
                </ButtonRow>
              </ButtonRow>
            </>
          )}

          {/* ── Step 3: Editorial ── */}
          {step === 'editorial' && selected && (
            <>
              <StepLabel>Preview</StepLabel>
              <PreviewCard style={{marginBottom: '0.75rem'}}>
                {selected.albumArt && <AlbumArt src={selected.albumArt} alt="" />}
                <TrackInfo>
                  <TrackName>{title || `${selected.name} – ${selected.artists}`}</TrackName>
                  <ArtistName>{blurb}</ArtistName>
                </TrackInfo>
              </PreviewCard>

              <FieldGroup>
                <FieldLabel>Custom Header</FieldLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={selected.name + ' – ' + selected.artists}
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Write as much as you want</FieldLabel>
                <Textarea value={blurb} onChange={(e) => setBlurb(e.target.value)} />
              </FieldGroup>

              <ButtonRow style={{marginTop: '1rem', justifyContent: 'space-between'}}>
                <ActionButton type="button" $variant="secondary" onClick={() => setStep('apple')}>
                  ← Back
                </ActionButton>
                <ActionButton type="button" onClick={confirmTrack}>
                  Save ✓
                </ActionButton>
              </ButtonRow>
            </>
          )}
        </DialogBody>
      )}
    </Wrapper>
  )
}
