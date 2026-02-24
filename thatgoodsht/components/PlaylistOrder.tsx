import {useCallback, useEffect, useMemo, useState} from 'react'
import {useClient} from 'sanity'
import {useRouter} from 'sanity/router'
import styled from 'styled-components'

interface PlaylistDoc {
  _id: string
  name: string
  description: string
  order: number | null
  imageUrl: string | null
}

const QUERY = `*[_type == "playlist" && !(_id in path("drafts.**"))] | order(order asc) {
  _id, name, description, order,
  "imageUrl": thumb.asset->url
}`

const Wrapper = styled.div`
  --text-primary: #000;
  --text-secondary: #666;
  --text-muted: #999;
  --bg-surface: #e0d5f0;
  --bg-surface-hover: #f0edf8;
  --bg-neutral: #f5f5f5;
  --border-color: #e0e0e0;
  --border-dashed: #d0d0d0;

  [data-scheme="dark"] & {
    --text-primary: #e8e8e8;
    --text-secondary: #aaa;
    --text-muted: #777;
    --bg-surface: #2a2640;
    --bg-surface-hover: #332e50;
    --bg-neutral: #1e1e2e;
    --border-color: #444;
    --border-dashed: #555;
  }

  padding: 1.5rem;
  height: 100%;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-primary);
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
`

const Title = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
`

const NewButton = styled.button`
  background: #6c5cbe;
  color: #fff;
  border: none;
  padding: 0.35rem 0.7rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #5a4aad;
  }
`

const Subtitle = styled.p`
  margin: 0 0 1.25rem 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
`

const ContentLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
`

const GridSection = styled.div`
  flex: 0 0 auto;
`

const CoverGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  max-width: 630px;
`

const CoverSlot = styled.div<{$isDragOver?: boolean; $empty?: boolean}>`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: ${(p) => (p.$empty ? 'default' : 'pointer')};
  border: ${(p) =>
    p.$isDragOver
      ? '2px dashed #6c5cbe'
      : p.$empty
        ? '2px dashed var(--border-dashed)'
        : '2px solid transparent'};
  background: ${(p) => (p.$isDragOver ? 'var(--bg-surface)' : p.$empty ? 'var(--bg-neutral)' : 'transparent')};
  transition: border 0.15s, background 0.15s, transform 0.15s;
  &:hover {
    transform: ${(p) => (p.$empty ? 'none' : 'scale(0.98)')};
  }
`

const CoverImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

const CoverLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const EmptyLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.75rem;
  color: var(--text-muted);
`

const ListSection = styled.div`
  flex: 1 1 280px;
  min-width: 280px;
`

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`

const ViewLink = styled.a`
  font-size: 0.75rem;
  font-weight: 500;
  color: #6c5cbe;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

const ListContainer = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
`

const ListRow = styled.div<{$isDragOver?: boolean; $isDragging?: boolean}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  background: ${(p) => (p.$isDragOver ? 'var(--bg-surface)' : 'transparent')};
  opacity: ${(p) => (p.$isDragging ? 0.4 : 1)};
  transition: background 0.15s, opacity 0.15s;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: ${(p) => (p.$isDragOver ? 'var(--bg-surface)' : 'var(--bg-surface-hover)')};
  }
`

const ListThumb = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
`

const ListInfo = styled.div`
  min-width: 0;
  flex: 1;
`

const ListName = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ListDesc = styled.div`
  font-size: 0.7rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ListOrder = styled.span`
  font-size: 0.7rem;
  color: var(--text-muted);
  flex-shrink: 0;
  min-width: 20px;
  text-align: right;
`

export function PlaylistOrder() {
  const client = useClient({apiVersion: '2024-04-01'})
  const router = useRouter()
  const [playlists, setPlaylists] = useState<PlaylistDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchKey, setFetchKey] = useState(0)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)

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

  const pinned = useMemo(() => playlists.slice(0, 6), [playlists])
  const paddedPinned = useMemo(() => {
    const slots: (PlaylistDoc | null)[] = [...pinned]
    while (slots.length < 6) slots.push(null)
    return slots
  }, [pinned])

  const handleClick = useCallback(
    (doc: PlaylistDoc) => {
      router.navigateIntent('edit', {id: doc._id, type: 'playlist'})
    },
    [router],
  )

  const handleCreate = useCallback(async () => {
    const id = crypto.randomUUID()
    const order = playlists.length
    await client.create({
      _id: `drafts.${id}`,
      _type: 'playlist',
      name: 'Unused Playlist',
      order,
    })
    router.navigateIntent('edit', {id, type: 'playlist'})
  }, [client, router, playlists.length])

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
    setDraggedId(id)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedId(null)
    setDragOverTarget(null)
  }, [])

  const reorder = useCallback(
    async (fromId: string, toIndex: number) => {
      const fromIndex = playlists.findIndex((p) => p._id === fromId)
      if (fromIndex === -1 || fromIndex === toIndex) return

      const updated = [...playlists]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)

      // Optimistic update
      setPlaylists(updated)

      // Persist new order values
      const tx = client.transaction()
      updated.forEach((doc, i) => {
        if (doc.order !== i) {
          tx.patch(doc._id, (p) => p.set({order: i}))
        }
      })
      await tx.commit()
      setFetchKey((k) => k + 1)
    },
    [playlists, client],
  )

  const handleGridDrop = useCallback(
    (e: React.DragEvent, slotIndex: number) => {
      e.preventDefault()
      setDragOverTarget(null)
      const id = e.dataTransfer.getData('text/plain') || draggedId
      if (id) reorder(id, slotIndex)
    },
    [draggedId, reorder],
  )

  const handleListDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault()
      setDragOverTarget(null)
      const id = e.dataTransfer.getData('text/plain') || draggedId
      if (!id || id === targetId) return
      const targetIndex = playlists.findIndex((p) => p._id === targetId)
      if (targetIndex !== -1) reorder(id, targetIndex)
    },
    [draggedId, playlists, reorder],
  )

  if (loading && playlists.length === 0) {
    return (
      <Wrapper>
        <div style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>Loading...</div>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Header>
        <Title>Playlists</Title>
        <NewButton onClick={handleCreate}>+ New</NewButton>
      </Header>
      <Subtitle>Drag to reorder — first 6 are shown on the homepage</Subtitle>

      <ContentLayout>
        <GridSection>
          <CoverGrid>
            {paddedPinned.map((doc, i) => {
              const slotKey = `grid-${i}`
              const isDragOver = dragOverTarget === slotKey
              if (!doc) {
                return (
                  <CoverSlot
                    key={slotKey}
                    $empty
                    $isDragOver={isDragOver}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOverTarget(slotKey)
                    }}
                    onDragLeave={() => setDragOverTarget(null)}
                    onDrop={(e) => handleGridDrop(e, i)}
                  >
                    <EmptyLabel>Drop here</EmptyLabel>
                  </CoverSlot>
                )
              }
              const imgSrc = doc.imageUrl
                ? `${doc.imageUrl}?h=210&w=210&fit=crop&crop=center`
                : null
              return (
                <CoverSlot
                  key={doc._id}
                  $isDragOver={isDragOver}
                  draggable
                  onDragStart={(e) => handleDragStart(e, doc._id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverTarget(slotKey)
                  }}
                  onDragLeave={() => setDragOverTarget(null)}
                  onDrop={(e) => handleGridDrop(e, i)}
                  onClick={() => handleClick(doc)}
                >
                  {imgSrc && <CoverImage src={imgSrc} alt={doc.name} />}
                  <CoverLabel>{doc.name}</CoverLabel>
                </CoverSlot>
              )
            })}
          </CoverGrid>
        </GridSection>

        {playlists.length > 6 && (
          <ListSection>
            <ListHeader>
              Other Playlists
              <ViewLink href="https://thatgoodsht.com/playlists" target="_blank" rel="noopener">
                View ↗
              </ViewLink>
            </ListHeader>
            <ListContainer>
              {playlists.slice(6).map((doc, i) => {
                const isDragOver = dragOverTarget === `list-${doc._id}`
                const isDragging = draggedId === doc._id
                const imgSrc = doc.imageUrl
                  ? `${doc.imageUrl}?h=80&w=80&fit=crop&crop=center`
                  : null
                return (
                  <ListRow
                    key={doc._id}
                    $isDragOver={isDragOver}
                    $isDragging={isDragging}
                    draggable
                    onDragStart={(e) => handleDragStart(e, doc._id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOverTarget(`list-${doc._id}`)
                    }}
                    onDragLeave={() => setDragOverTarget(null)}
                    onDrop={(e) => handleListDrop(e, doc._id)}
                    onClick={() => handleClick(doc)}
                  >
                    <ListOrder>{i + 7}</ListOrder>
                    {imgSrc && <ListThumb src={imgSrc} alt={doc.name} />}
                    <ListInfo>
                      <ListName>{doc.name}</ListName>
                      <ListDesc>{doc.description}</ListDesc>
                    </ListInfo>
                  </ListRow>
                )
              })}
            </ListContainer>
          </ListSection>
        )}
      </ContentLayout>
    </Wrapper>
  )
}
