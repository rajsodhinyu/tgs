import {useState, useCallback, useEffect} from 'react'
import {set, unset} from 'sanity'
import {useClient} from 'sanity'
import styled from 'styled-components'

// ── Styled Components ──

const Wrapper = styled.div`
  --text-primary: #222;
  --text-secondary: #666;
  --text-muted: #999;
  --bg-surface: #f3f1fa;
  --bg-neutral: #fafafa;
  --border-color: #ddd;

  [data-scheme='dark'] & {
    --text-primary: #e8e8e8;
    --text-secondary: #aaa;
    --text-muted: #777;
    --bg-surface: #2a2640;
    --bg-neutral: #1e1e2e;
    --border-color: #444;
  }

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const DialogBody = styled.div`
  padding: 1.25rem;
`

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
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

const CoverArt = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
`

const Info = styled.div`
  flex: 1;
  min-width: 0;
`

const Name = styled.div`
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Description = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

const Label = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`

const ActionButton = styled.button`
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  background: #6c5cbe;
  color: #fff;
  &:hover {
    opacity: 0.85;
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`

const RefreshButton = styled.button`
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  font-size: 0.75rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  background: transparent;
  color: var(--text-secondary);
  &:hover {
    background: var(--bg-surface);
  }
`

// ── Types ──

interface PlaylistDoc {
  _id: string
  name: string
  description: string
  playlistURL: string
  appleMusicURL?: string
  imageUrl: string | null
}

const QUERY = `*[_type == "playlist" && !(_id in path("drafts.**"))] | order(order asc) {
  _id, name, description, playlistURL, appleMusicURL,
  "imageUrl": thumb.asset->url
}`

// ── Component ──

export function PlaylistPickerInput(props: any) {
  const {onChange} = props
  const client = useClient({apiVersion: '2024-04-01'})

  const [playlists, setPlaylists] = useState<PlaylistDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [fetchKey, setFetchKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    client
      .fetch<PlaylistDoc[]>(QUERY)
      .then((docs) => {
        setPlaylists(docs)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [client, fetchKey])

  const handleCreate = useCallback(async () => {
    setCreating(true)
    try {
      const id = crypto.randomUUID()
      await client.create({
        _id: `drafts.${id}`,
        _type: 'playlist',
        name: 'New Playlist',
        order: playlists.length,
      })
      // Open the new playlist in a new tab for editing
      window.open(`${window.location.origin}/intent/edit/id=${id};type=playlist`, '_blank')
    } catch {
      // silently fail
    } finally {
      setCreating(false)
    }
  }, [client, playlists.length])

  const handleRefresh = useCallback(() => {
    setFetchKey((k) => k + 1)
  }, [])

  const handleSelect = useCallback(
    (doc: PlaylistDoc) => {
      onChange(set(doc.name, ['name']))
      onChange(set(doc.description || '', ['description']))
      onChange(set(doc.playlistURL, ['spotifyUrl']))

      if (doc.appleMusicURL) {
        onChange(set(doc.appleMusicURL, ['appleMusicUrl']))
      } else {
        onChange(unset(['appleMusicUrl']))
      }

      if (doc.imageUrl) {
        onChange(set(doc.imageUrl, ['coverUrl']))
      } else {
        onChange(unset(['coverUrl']))
      }

      // Auto-close the dialog
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
    },
    [onChange, props],
  )

  return (
    <Wrapper>
      <DialogBody>
        <HeaderRow>
          <Label style={{marginBottom: 0}}>Select a playlist</Label>
          <div style={{display: 'flex', gap: '0.4rem'}}>
            <RefreshButton type="button" onClick={handleRefresh}>
              Refresh
            </RefreshButton>
            <ActionButton type="button" disabled={creating} onClick={handleCreate}>
              {creating ? 'Creating...' : '+ New'}
            </ActionButton>
          </div>
        </HeaderRow>

        {loading && (
          <div style={{display: 'flex', gap: '4px', padding: '0.5rem 0'}}>
            <SpinnerDot style={{animationDelay: '0s'}} />
            <SpinnerDot style={{animationDelay: '0.2s'}} />
            <SpinnerDot style={{animationDelay: '0.4s'}} />
          </div>
        )}

        {!loading && playlists.length === 0 && (
          <div style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>No playlists found.</div>
        )}

        <ResultsList>
          {playlists.map((doc) => {
            const imgSrc = doc.imageUrl ? `${doc.imageUrl}?h=96&w=96&fit=crop&crop=center` : null
            return (
              <ResultRow key={doc._id} type="button" $selected={false} onClick={() => handleSelect(doc)}>
                {imgSrc && <CoverArt src={imgSrc} alt="" />}
                <Info>
                  <Name>{doc.name}</Name>
                  <Description>{doc.description}</Description>
                </Info>
              </ResultRow>
            )
          })}
        </ResultsList>
      </DialogBody>
    </Wrapper>
  )
}
