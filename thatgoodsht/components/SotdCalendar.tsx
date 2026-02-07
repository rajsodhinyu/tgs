import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useClient} from 'sanity'
import {useRouter} from 'sanity/router'
import styled from 'styled-components'

type View = 'calendar' | 'list'

// Module-level audio state so it survives component remounts
let globalAudio: HTMLAudioElement | null = null
let globalPlayingId: string | null = null
let globalPaused = false

interface SotdDoc {
  _id: string
  name: string
  artist: string
  datetime: string | null
  fileUrl: string | null
}

interface YearMonth {
  year: number
  month: number
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function dayKey(year: number, month: number, day: number) {
  return `${year}-${month}-${day}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function prevYearMonth(ym: YearMonth): YearMonth {
  return ym.month === 0 ? {year: ym.year - 1, month: 11} : {year: ym.year, month: ym.month - 1}
}

function nextYearMonth(ym: YearMonth): YearMonth {
  return ym.month === 11 ? {year: ym.year + 1, month: 0} : {year: ym.year, month: ym.month + 1}
}

const OuterWrapper = styled.div`
  display: flex;
  height: 100%;
  color: #000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`

const Wrapper = styled.div`
  padding: 1.5rem;
  flex: 1;
  min-width: 0;
  overflow-y: auto;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  position: sticky;
  top: 0;
  background: inherit;
  z-index: 2;
  padding: 0.5rem 0;
`

const SwapToggle = styled.button<{$active: boolean}>`
  background: ${(p) => (p.$active ? '#6c5cbe' : '#f0f0f0')};
  border: 1px solid ${(p) => (p.$active ? '#6c5cbe' : '#d0d0d0')};
  color: ${(p) => (p.$active ? '#fff' : '#000')};
  padding: 0.35rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  &:hover {
    background: ${(p) => (p.$active ? '#5a4aad' : '#e0e0e0')};
  }
`

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  overflow: hidden;
`

const ViewToggleButton = styled.button<{$active: boolean}>`
  background: ${(p) => (p.$active ? '#6c5cbe' : '#f0f0f0')};
  border: none;
  color: ${(p) => (p.$active ? '#fff' : '#000')};
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  font-size: 0.75rem;
  &:hover {
    background: ${(p) => (p.$active ? '#6c5cbe' : '#e0e0e0')};
  }
  & + & {
    border-left: 1px solid #d0d0d0;
  }
`

const MonthSection = styled.div`
  margin-bottom: 2rem;
`

const MonthTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #000;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 1px;
  background: #d0d0d0;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  overflow: hidden;
`

const DayHeader = styled.div`
  padding: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  background: #f5f5f5;
  text-transform: uppercase;
`

const AddButton = styled.button`
  background: #f0f0f0;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  cursor: pointer;
  padding: 0.15rem 0.4rem;
  font-size: 0.5rem;
  color: #333;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
  &:hover {
    background: #e0e0e0;
  }
`

const DayCell = styled.div<{
  $empty?: boolean
  $hasSong?: boolean
  $isToday?: boolean
  $isDragOver?: boolean
  $isDragging?: boolean
}>`
  min-height: 90px;
  padding: 0.4rem;
  overflow: hidden;
  background: ${(p) =>
    p.$isDragOver ? '#e0d5f0' : p.$empty ? '#fafafa' : p.$hasSong ? '#f0edf8' : '#fff'};
  cursor: ${(p) => (p.$isDragging ? 'grabbing' : p.$empty ? 'default' : 'pointer')};
  border: ${(p) =>
    p.$isDragOver ? '2px dashed #6c5cbe' : p.$isToday ? '2px solid #6c5cbe' : 'none'};
  opacity: ${(p) => (p.$isDragging ? 0.5 : 1)};
  transition:
    background 0.15s,
    opacity 0.15s;
  &:hover {
    background: ${(p) =>
      p.$isDragOver ? '#e0d5f0' : p.$empty ? '#fafafa' : p.$hasSong ? '#e6e0f3' : '#f5f5f5'};
  }
  &:hover ${AddButton} {
    opacity: 1;
  }
`

const DayNumber = styled.span<{$isToday?: boolean}>`
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${(p) => (p.$isToday ? '#fff' : '#666')};
  margin-bottom: 0.25rem;
  ${(p) =>
    p.$isToday &&
    `
    background: #6c5cbe;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
  `}
`

const SongInfo = styled.div`
  font-size: 0.7rem;
  line-height: 1.3;
`

const Artist = styled.div`
  color: #6c5cbe;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SongTitle = styled.div`
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PlayButton = styled.button<{$playing?: boolean}>`
  background: ${(p) => (p.$playing ? '#6c5cbe' : '#f0f0f0')};
  border: 1px solid ${(p) => (p.$playing ? '#6c5cbe' : '#d0d0d0')};
  border-radius: 4px;
  cursor: pointer;
  padding: 0.15rem ${(p) => (p.$playing ? '0.45rem' : '0.4rem')};
  font-size: 0.5rem;
  color: ${(p) => (p.$playing ? '#fff' : '#333')};
  flex-shrink: 0;
  &:hover {
    background: ${(p) => (p.$playing ? '#5a4aad' : '#e0e0e0')};
  }
`

const ListRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.15s;
  &:hover {
    background: #f0edf8;
  }
`

const ListDate = styled.span`
  font-size: 0.75rem;
  color: #666;
  min-width: 130px;
  flex-shrink: 0;
`

const ListArtist = styled.span`
  color: #6c5cbe;
  font-weight: 600;
  font-size: 0.85rem;
`

const ListSongTitle = styled.span`
  color: #333;
  font-size: 0.85rem;
`

const ListContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
`

const PublishedDotWrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  cursor: default;
  &:hover span:last-child {
    opacity: 1;
  }
`

const Dot = styled.span<{$color?: string}>`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${(p) => p.$color || '#2ecc40'};
`

const Tooltip = styled.span`
  position: absolute;
  left: 50%;
  bottom: calc(100% + 4px);
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  font-size: 0.6rem;
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
`

function PublishedDot() {
  return (
    <PublishedDotWrapper>
      <Dot />
      <Tooltip>Published!</Tooltip>
    </PublishedDotWrapper>
  )
}

const LoadButton = styled.button`
  background: #f0f0f0;
  border: 1px solid #d0d0d0;
  color: #000;
  padding: 0.35rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  &:hover {
    background: #e0e0e0;
  }
`

const AZButton = styled.button<{$active: boolean}>`
  background: ${(p) => (p.$active ? '#6c5cbe' : 'transparent')};
  border: 1px solid ${(p) => (p.$active ? '#6c5cbe' : '#d0d0d0')};
  color: ${(p) => (p.$active ? '#fff' : '#666')};
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.65rem;
  font-weight: 600;
  &:hover {
    background: ${(p) => (p.$active ? '#5a4aad' : '#f0f0f0')};
  }
`

const ShowPastButton = styled.button`
  background: none;
  border: none;
  color: #6c5cbe;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0;
  margin-bottom: 0.5rem;
  &:hover {
    text-decoration: underline;
  }
`

const Sidebar = styled.div<{$dragOver?: boolean}>`
  width: 220px;
  flex-shrink: 0;
  border-left: 1px solid #d0d0d0;
  background: ${(p) => (p.$dragOver ? '#e0d5f0' : '#fafafa')};
  overflow-y: auto;
  transition: background 0.15s;
`

const SidebarHeader = styled.div`
  position: sticky;
  top: 0;
  background: #f5f5f5;
  padding: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-bottom: 1px solid #d0d0d0;
  z-index: 1;
`

const SidebarItem = styled.div<{$isDragging?: boolean}>`
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #e8e8e8;
  cursor: pointer;
  opacity: ${(p) => (p.$isDragging ? 0.5 : 1)};
  transition:
    background 0.15s,
    opacity 0.15s;
  &:hover {
    background: #f0edf8;
  }
`

const SidebarArtist = styled.div`
  color: #6c5cbe;
  font-weight: 600;
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SidebarSongTitle = styled.div`
  color: #333;
  font-size: 0.65rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export function SotdCalendar() {
  const client = useClient({apiVersion: '2024-04-01'})
  const router = useRouter()
  const today = new Date()
  const [view, setView] = useState<View>('calendar')
  const [visibleMonths, setVisibleMonths] = useState<YearMonth[]>(() => {
    const first = {year: today.getFullYear(), month: today.getMonth()}
    return [first, nextYearMonth(first), nextYearMonth(nextYearMonth(first))]
  })
  const [songs, setSongs] = useState<SotdDoc[]>([])
  const [allSongs, setAllSongs] = useState<SotdDoc[]>([])
  const [showPast, setShowPast] = useState(false)
  const [sortByArtist, setSortByArtist] = useState(false)
  const [sidebarSortByArtist, setSidebarSortByArtist] = useState(false)
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [playingId, _setPlayingId] = useState<string | null>(globalPlayingId)
  const [paused, _setPaused] = useState(globalPaused)
  const audioRef = useRef<HTMLAudioElement | null>(globalAudio)

  const setPlayingId = useCallback((id: string | null) => {
    globalPlayingId = id
    _setPlayingId(id)
  }, [])

  const setPaused = useCallback((p: boolean) => {
    globalPaused = p
    _setPaused(p)
  }, [])
  const [swapMode, setSwapMode] = useState(true)
  const [draggedSong, setDraggedSong] = useState<SotdDoc | null>(null)
  const [dragOverKey, setDragOverKey] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)
  const [unscheduledSongs, setUnscheduledSongs] = useState<SotdDoc[]>([])
  const [dragOverSidebar, setDragOverSidebar] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const rangeStart = useMemo(() => {
    const first = visibleMonths[0]
    return new Date(first.year, first.month, 1).toISOString()
  }, [visibleMonths])

  const rangeEnd = useMemo(() => {
    const last = visibleMonths[visibleMonths.length - 1]
    return new Date(last.year, last.month + 1, 1).toISOString()
  }, [visibleMonths])

  // Fetch songs for visible range
  useEffect(() => {
    if (view !== 'calendar') return
    setLoading(true)
    client
      .fetch<SotdDoc[]>(
        `*[_type == 'sotd' && datetime >= $start && datetime < $end] | order(datetime asc) { _id, name, artist, datetime, "fileUrl": file.asset->url }`,
        {start: rangeStart, end: rangeEnd},
      )
      .then((docs) => {
        setSongs(docs)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [client, rangeStart, rangeEnd, view, fetchKey])

  // Fetch unscheduled songs (no datetime)
  useEffect(() => {
    client
      .fetch<SotdDoc[]>(
        `*[_type == 'sotd' && !defined(datetime)] | order(_updatedAt asc) { _id, name, artist, datetime, "fileUrl": file.asset->url }`,
      )
      .then((docs) => setUnscheduledSongs(docs))
      .catch(() => {})
  }, [client, fetchKey])

  // Fetch all songs for list view
  useEffect(() => {
    if (view !== 'list') return
    setLoading(true)
    client
      .fetch<SotdDoc[]>(
        `*[_type == 'sotd'] | order(datetime asc) { _id, name, artist, datetime, "fileUrl": file.asset->url }`,
      )
      .then((docs) => {
        setAllSongs(docs)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [client, view])

  // Fetch published document IDs
  useEffect(() => {
    client
      .fetch<string[]>(`*[_type == 'sotd' && !(_id in path("drafts.**"))]._id`)
      .then((ids) => setPublishedIds(new Set(ids)))
      .catch(() => {})
  }, [client, songs, allSongs])

  // Auto-load next month when scrolling to bottom
  useEffect(() => {
    if (view !== 'calendar') return
    const el = bottomRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleMonths((prev) => [...prev, nextYearMonth(prev[prev.length - 1])])
        }
      },
      {threshold: 0.1},
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [view, visibleMonths])

  const isPublished = useCallback(
    (id: string) => publishedIds.has(id) || publishedIds.has(id.replace('drafts.', '')),
    [publishedIds],
  )

  const songsByKey = useMemo(() => {
    const map: Record<string, SotdDoc> = {}
    for (const song of songs) {
      if (!song.datetime) continue
      const d = new Date(song.datetime)
      map[dayKey(d.getFullYear(), d.getMonth(), d.getDate())] = song
    }
    return map
  }, [songs])

  const todayStart = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }, [])

  const visibleSongs = useMemo(() => {
    const filtered = showPast
      ? allSongs
      : allSongs.filter((s) => !s.datetime || new Date(s.datetime).getTime() >= todayStart)
    if (sortByArtist) {
      return [...filtered].sort((a, b) => (a.artist || '').localeCompare(b.artist || ''))
    }
    return filtered
  }, [allSongs, showPast, todayStart, sortByArtist])

  const sortedUnscheduled = useMemo(() => {
    if (sidebarSortByArtist) {
      return [...unscheduledSongs].sort((a, b) => (a.artist || '').localeCompare(b.artist || ''))
    }
    return unscheduledSongs
  }, [unscheduledSongs, sidebarSortByArtist])

  const pastCount = useMemo(() => {
    return allSongs.filter((s) => s.datetime && new Date(s.datetime).getTime() < todayStart).length
  }, [allSongs, todayStart])

  const loadPrevMonth = useCallback(() => {
    setVisibleMonths((prev) => [prevYearMonth(prev[0]), ...prev])
  }, [])

  const handleSongClick = useCallback(
    (song: SotdDoc) => {
      router.navigateIntent('edit', {id: song._id, type: 'sotd'})
    },
    [router],
  )

  const handleCreateUnscheduled = useCallback(async () => {
    const id = crypto.randomUUID()
    await client.createIfNotExists({
      _id: `drafts.${id}`,
      _type: 'sotd',
    })
    router.navigateIntent('edit', {id, type: 'sotd'})
  }, [client, router])

  const handleEmptyDayDoubleClick = useCallback(
    async (y: number, m: number, d: number) => {
      const datetime = new Date(Date.UTC(y, m, d, 12, 0, 0)).toISOString()
      const id = crypto.randomUUID()
      await client.createIfNotExists({
        _id: `drafts.${id}`,
        _type: 'sotd',
        datetime,
      })
      router.navigateIntent('edit', {id, type: 'sotd'})
    },
    [client, router],
  )

  const handlePlay = useCallback(
    (e: React.MouseEvent, song: SotdDoc) => {
      e.stopPropagation()
      if (!song.fileUrl) return
      if (playingId === song._id) {
        audioRef.current?.pause()
        globalAudio = null
        setPlayingId(null)
        setPaused(false)
        return
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(song.fileUrl)
      audio.onended = () => {
        globalAudio = null
        setPlayingId(null)
        setPaused(false)
      }
      audio.play()
      audioRef.current = audio
      globalAudio = audio
      setPlayingId(song._id)
      setPaused(false)
    },
    [playingId, setPlayingId, setPaused],
  )

  const handleGlobalPlayPause = useCallback(() => {
    if (playingId && audioRef.current) {
      if (paused) {
        audioRef.current.play()
        setPaused(false)
      } else {
        audioRef.current.pause()
        setPaused(true)
      }
    }
  }, [playingId, paused])

  const handleDragScroll = useCallback((e: React.DragEvent) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const edge = 140
    const speed = 12
    if (e.clientY - rect.top < edge) {
      wrapper.scrollTop -= speed
    } else if (rect.bottom - e.clientY < edge) {
      wrapper.scrollTop += speed
    }
  }, [])

  const handleSwapDates = useCallback(
    async (targetKey: string) => {
      if (!draggedSong) return
      const targetSong = songsByKey[targetKey]
      if (targetSong && targetSong._id === draggedSong._id) return

      const [ty, tm, td] = targetKey.split('-').map(Number)
      const fromSidebar = !draggedSong.datetime
      const hour = fromSidebar ? 12 : new Date(draggedSong.datetime!).getUTCHours()
      const minute = fromSidebar ? 0 : new Date(draggedSong.datetime!).getUTCMinutes()
      const targetDate = new Date(Date.UTC(ty, tm, td, hour, minute, 0)).toISOString()

      if (targetSong && fromSidebar) {
        // Sidebar → occupied cell: assign date to dragged, unschedule displaced
        await client
          .transaction()
          .patch(draggedSong._id, (p) => p.set({datetime: targetDate}))
          .patch(targetSong._id, (p) => p.unset(['datetime']))
          .commit()
      } else if (targetSong) {
        // Calendar → occupied cell: swap dates
        await client
          .transaction()
          .patch(draggedSong._id, (p) => p.set({datetime: targetDate}))
          .patch(targetSong._id, (p) => p.set({datetime: draggedSong.datetime!}))
          .commit()
      } else {
        // Any → empty cell: just assign date
        await client.patch(draggedSong._id).set({datetime: targetDate}).commit()
      }

      setDraggedSong(null)
      setDragOverKey(null)
      setFetchKey((k) => k + 1)
    },
    [draggedSong, songsByKey, client],
  )

  const handleUnschedule = useCallback(async () => {
    if (!draggedSong || !draggedSong.datetime) return
    await client.patch(draggedSong._id).unset(['datetime']).commit()
    setDraggedSong(null)
    setDragOverSidebar(false)
    setFetchKey((k) => k + 1)
  }, [draggedSong, client])

  const playingSong = useMemo(() => {
    if (!playingId) return null
    return (
      songs.find((s) => s._id === playingId) ||
      unscheduledSongs.find((s) => s._id === playingId) ||
      allSongs.find((s) => s._id === playingId) ||
      null
    )
  }, [playingId, songs, unscheduledSongs, allSongs])

  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const todayDate = today.getDate()

  return (
    <OuterWrapper>
      <Wrapper ref={wrapperRef} onDragOver={swapMode ? handleDragScroll : undefined}>
        <Header>
          {view === 'calendar' ? (
            <LoadButton onClick={loadPrevMonth}>
              Load {MONTH_NAMES[prevYearMonth(visibleMonths[0]).month]}
            </LoadButton>
          ) : (
            <div />
          )}
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            {playingId && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  maxWidth: '200px',
                }}
              >
                {playingSong && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      backgroundColor: '#6c5cbe',
                      color: '#fff',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      border: '1px 1px 1px 1px solid #6c5cbe',
                      borderRadius: '4px',
                      padding: '2px 4px',
                    }}
                  >
                    <PlayButton $playing onClick={handleGlobalPlayPause}>
                      {paused ? '\u25B6' : '\u25A0'}
                    </PlayButton>
                    {playingSong.name}
                  </span>
                )}
              </div>
            )}
          </div>
          <ViewToggle>
            <ViewToggleButton $active={view === 'calendar'} onClick={() => setView('calendar')}>
              Calendar
            </ViewToggleButton>
            <ViewToggleButton $active={view === 'list'} onClick={() => setView('list')}>
              List
            </ViewToggleButton>
          </ViewToggle>
        </Header>

        {loading && (
          <div style={{textAlign: 'center', padding: '2rem', color: '#666'}}>Loading...</div>
        )}

        {view === 'calendar' && (
          <>
            {visibleMonths.map((m) => {
              const totalDays = getMonthDays(m.year, m.month)
              const firstDay = getFirstDayOfWeek(m.year, m.month)
              const isCurrMonth = m.year === todayYear && m.month === todayMonth

              return (
                <MonthSection key={`${m.year}-${m.month}`}>
                  <MonthTitle>
                    {MONTH_NAMES[m.month]} {m.year}
                  </MonthTitle>
                  <Grid>
                    {DAYS_OF_WEEK.map((d) => (
                      <DayHeader key={d}>{d}</DayHeader>
                    ))}
                    {Array.from({length: firstDay}).map((_, i) => (
                      <DayCell key={`pad-${i}`} $empty />
                    ))}
                    {Array.from({length: totalDays}).map((_, i) => {
                      const day = i + 1
                      const key = dayKey(m.year, m.month, day)
                      const song = songsByKey[key]
                      const isToday = isCurrMonth && day === todayDate
                      return (
                        <DayCell
                          key={day}
                          $hasSong={!!song}
                          $isToday={isToday}
                          $isDragOver={dragOverKey === key}
                          $isDragging={!!draggedSong && draggedSong._id === song?._id}
                          draggable={swapMode && !!song}
                          onClick={song ? () => handleSongClick(song) : undefined}
                          onDragStart={
                            swapMode && song
                              ? (e) => {
                                  e.dataTransfer.effectAllowed = 'move'
                                  setDraggedSong(song)
                                }
                              : undefined
                          }
                          onDragOver={
                            swapMode
                              ? (e) => {
                                  e.preventDefault()
                                  setDragOverKey(key)
                                }
                              : undefined
                          }
                          onDragLeave={swapMode ? () => setDragOverKey(null) : undefined}
                          onDrop={
                            swapMode
                              ? (e) => {
                                  e.preventDefault()
                                  handleSwapDates(key)
                                }
                              : undefined
                          }
                          onDragEnd={
                            swapMode
                              ? () => {
                                  setDraggedSong(null)
                                  setDragOverKey(null)
                                  setDragOverSidebar(false)
                                }
                              : undefined
                          }
                        >
                          <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                            <DayNumber $isToday={isToday}>{day}</DayNumber>
                            {song?.fileUrl ? (
                              <PlayButton
                                $playing={playingId === song._id}
                                onClick={(e) => handlePlay(e, song)}
                              >
                                {playingId === song._id ? '\u25A0' : '\u25B6'}
                              </PlayButton>
                            ) : !song ? (
                              <AddButton
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEmptyDayDoubleClick(m.year, m.month, day)
                                }}
                              >
                                +
                              </AddButton>
                            ) : null}
                            {song && !song.artist && <Dot $color="#f1c40f" />}
                            {song && isPublished(song._id) && <PublishedDot />}
                          </div>
                          {song && (
                            <SongInfo>
                              <Artist>{song.artist}</Artist>
                              <SongTitle>{song.name}</SongTitle>
                            </SongInfo>
                          )}
                        </DayCell>
                      )
                    })}
                  </Grid>
                </MonthSection>
              )
            })}

            <div ref={bottomRef} style={{height: '50vh'}} />
          </>
        )}

        {view === 'list' && !loading && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.5rem',
              }}
            >
              {pastCount > 0 && (
                <ShowPastButton style={{margin: 0}} onClick={() => setShowPast((v) => !v)}>
                  {showPast
                    ? 'Hide past songs'
                    : `Show ${pastCount} past song${pastCount === 1 ? '' : 's'}`}
                </ShowPastButton>
              )}
              <AZButton $active={sortByArtist} onClick={() => setSortByArtist((v) => !v)}>
                A-Z
              </AZButton>
            </div>
            <ListContainer>
              {visibleSongs.map((song) => (
                <ListRow key={song._id} onClick={() => handleSongClick(song)}>
                  <ListDate>{song.datetime ? formatDate(song.datetime) : 'Unscheduled'}</ListDate>
                  {song.fileUrl && (
                    <PlayButton
                      $playing={playingId === song._id}
                      onClick={(e) => handlePlay(e, song)}
                    >
                      {playingId === song._id ? '\u25A0' : '\u25B6'}
                    </PlayButton>
                  )}
                  {isPublished(song._id) && <PublishedDot />}
                  <ListArtist>{song.artist}</ListArtist>
                  <ListSongTitle>{song.name}</ListSongTitle>
                </ListRow>
              ))}
              {visibleSongs.length === 0 && (
                <div style={{padding: '2rem', textAlign: 'center', color: '#666'}}>
                  No songs found
                </div>
              )}
            </ListContainer>
          </>
        )}
      </Wrapper>

      {view === 'calendar' && (
        <Sidebar
          $dragOver={dragOverSidebar}
          onDragOver={
            swapMode
              ? (e) => {
                  e.preventDefault()
                  setDragOverSidebar(true)
                }
              : undefined
          }
          onDragLeave={swapMode ? () => setDragOverSidebar(false) : undefined}
          onDrop={
            swapMode
              ? (e) => {
                  e.preventDefault()
                  handleUnschedule()
                }
              : undefined
          }
        >
          <SidebarHeader>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              Unscheduled
              <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                <AddButton style={{opacity: 1}} onClick={handleCreateUnscheduled}>
                  +
                </AddButton>
                <AZButton
                  $active={sidebarSortByArtist}
                  onClick={() => setSidebarSortByArtist((v) => !v)}
                >
                  A-Z
                </AZButton>
              </div>
            </div>
          </SidebarHeader>
          {sortedUnscheduled.map((song) => (
            <SidebarItem
              key={song._id}
              $isDragging={!!draggedSong && draggedSong._id === song._id}
              draggable={swapMode}
              onClick={() => handleSongClick(song)}
              onDragStart={
                swapMode
                  ? (e) => {
                      e.dataTransfer.effectAllowed = 'move'
                      setDraggedSong(song)
                    }
                  : undefined
              }
              onDragEnd={
                swapMode
                  ? () => {
                      setDraggedSong(null)
                      setDragOverKey(null)
                      setDragOverSidebar(false)
                    }
                  : undefined
              }
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                {song.fileUrl ? (
                  <PlayButton
                    $playing={playingId === song._id}
                    onClick={(e) => handlePlay(e, song)}
                    style={{fontSize: '0.45rem', padding: '0.1rem 0.3rem'}}
                  >
                    {playingId === song._id ? '\u25A0' : '\u25B6'}
                  </PlayButton>
                ) : (
                  <div style={{width: '18px', flexShrink: 0}} />
                )}
                <div style={{minWidth: 0}}>
                  <SidebarArtist>{song.artist || 'Unknown Artist'}</SidebarArtist>
                  <SidebarSongTitle>{song.name || 'Untitled'}</SidebarSongTitle>
                </div>
              </div>
            </SidebarItem>
          ))}
          {unscheduledSongs.length === 0 && (
            <div style={{padding: '1rem 0.75rem', color: '#999', fontSize: '0.7rem'}}>
              No unscheduled songs
            </div>
          )}
        </Sidebar>
      )}
    </OuterWrapper>
  )
}
