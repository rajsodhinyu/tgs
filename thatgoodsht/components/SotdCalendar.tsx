import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useClient} from 'sanity'
import {useRouter} from 'sanity/router'
import styled from 'styled-components'

type View = 'calendar' | 'list'

interface SotdDoc {
  _id: string
  name: string
  artist: string
  datetime: string
  fileUrl: string | null
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

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

const Wrapper = styled.div`
  padding: 1.5rem;
  color: #000;
  height: 100%;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
`

const MonthTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #000;
  min-width: 200px;
  text-align: center;
`

const NavButton = styled.button`
  background: #f0f0f0;
  border: 1px solid #d0d0d0;
  color: #000;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  &:hover {
    background: #e0e0e0;
  }
`

const TodayButtonHidden = styled(NavButton)`
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  visibility: hidden;
`

const TodayButton = styled(NavButton)`
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
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

const DayCell = styled.div<{$empty?: boolean; $hasSong?: boolean; $isToday?: boolean}>`
  min-height: 90px;
  padding: 0.4rem;
  background: ${(p) => (p.$empty ? '#fafafa' : p.$hasSong ? '#f0edf8' : '#fff')};
  cursor: ${(p) => (p.$empty ? 'default' : 'pointer')};
  border: ${(p) => (p.$isToday ? '2px solid #6c5cbe' : 'none')};
  transition: background 0.15s;
  &:hover {
    background: ${(p) => (p.$empty ? '#fafafa' : p.$hasSong ? '#e6e0f3' : '#f5f5f5')};
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

const Dot = styled.span`
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2ecc40;
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

export function SotdCalendar() {
  const client = useClient({apiVersion: '2024-04-01'})
  const router = useRouter()
  const today = new Date()
  const [view, setView] = useState<View>('calendar')
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [songs, setSongs] = useState<SotdDoc[]>([])
  const [allSongs, setAllSongs] = useState<SotdDoc[]>([])
  const [showPast, setShowPast] = useState(false)
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Fetch songs for calendar month view
  useEffect(() => {
    if (view !== 'calendar') return
    setLoading(true)
    const start = new Date(year, month, 1).toISOString()
    const end = new Date(year, month + 1, 1).toISOString()
    client
      .fetch<SotdDoc[]>(
        `*[_type == 'sotd' && datetime >= $start && datetime < $end] | order(datetime asc) { _id, name, artist, datetime, "fileUrl": file.asset->url }`,
        {start, end},
      )
      .then((docs) => {
        setSongs(docs)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [client, year, month, view])

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

  const isPublished = useCallback(
    (id: string) => publishedIds.has(id) || publishedIds.has(id.replace('drafts.', '')),
    [publishedIds],
  )

  const songsByDay = useMemo(() => {
    const map: Record<number, SotdDoc> = {}
    for (const song of songs) {
      const d = new Date(song.datetime)
      map[d.getDate()] = song
    }
    return map
  }, [songs])

  const todayStart = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }, [])

  const visibleSongs = useMemo(() => {
    if (showPast) return allSongs
    return allSongs.filter((s) => new Date(s.datetime).getTime() >= todayStart)
  }, [allSongs, showPast, todayStart])

  const pastCount = useMemo(() => {
    return allSongs.filter((s) => new Date(s.datetime).getTime() < todayStart).length
  }, [allSongs, todayStart])

  const prevMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }, [month])

  const nextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }, [month])

  const goToToday = useCallback(() => {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }, [today])

  const handleSongClick = useCallback(
    (song: SotdDoc) => {
      router.navigateIntent('edit', {id: song._id, type: 'sotd'})
    },
    [router],
  )

  const handleEmptyDayDoubleClick = useCallback(
    async (day: number) => {
      const datetime = new Date(Date.UTC(year, month, day, 12, 0, 0)).toISOString()
      const id = crypto.randomUUID()
      await client.createIfNotExists({
        _id: `drafts.${id}`,
        _type: 'sotd',
        datetime,
      })
      router.navigateIntent('edit', {id, type: 'sotd'})
    },
    [client, router, year, month],
  )

  const handlePlay = useCallback(
    (e: React.MouseEvent, song: SotdDoc) => {
      e.stopPropagation()
      if (!song.fileUrl) return
      if (playingId === song._id) {
        audioRef.current?.pause()
        setPlayingId(null)
        return
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(song.fileUrl)
      audio.onended = () => setPlayingId(null)
      audio.play()
      audioRef.current = audio
      setPlayingId(song._id)
    },
    [playingId],
  )

  const totalDays = getMonthDays(year, month)
  const firstDay = getFirstDayOfWeek(year, month)
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  return (
    <Wrapper>
      <Header>
        {view === 'calendar' ? <NavButton onClick={prevMonth}>&larr;</NavButton> : <div />}

        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
          <ViewToggle>
            <ViewToggleButton $active={view === 'calendar'} onClick={() => setView('calendar')}>
              Calendar
            </ViewToggleButton>
            <ViewToggleButton $active={view === 'list'} onClick={() => setView('list')}>
              List
            </ViewToggleButton>
          </ViewToggle>
          {view === 'calendar' && (
            <MonthTitle>
              {MONTH_NAMES[month]} {year}
            </MonthTitle>
          )}
          {view === 'calendar' &&
            (!isCurrentMonth ? (
              <TodayButton onClick={goToToday}>Today</TodayButton>
            ) : (
              <TodayButtonHidden onClick={goToToday}>Today</TodayButtonHidden>
            ))}
        </div>
        {view === 'calendar' ? <NavButton onClick={nextMonth}>&rarr;</NavButton> : <div />}
      </Header>

      {loading && (
        <div style={{textAlign: 'center', padding: '2rem', color: '#666'}}>Loading...</div>
      )}

      {view === 'calendar' && (
        <Grid>
          {DAYS_OF_WEEK.map((d) => (
            <DayHeader key={d}>{d}</DayHeader>
          ))}
          {Array.from({length: firstDay}).map((_, i) => (
            <DayCell key={`pad-${i}`} $empty />
          ))}
          {Array.from({length: totalDays}).map((_, i) => {
            const day = i + 1
            const song = songsByDay[day]
            const isToday = isCurrentMonth && day === today.getDate()
            return (
              <DayCell
                key={day}
                $hasSong={!!song}
                $isToday={isToday}
                onClick={song ? () => handleSongClick(song) : undefined}
                onDoubleClick={!song ? () => handleEmptyDayDoubleClick(day) : undefined}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <DayNumber $isToday={isToday}>{day}</DayNumber>
                  {song?.fileUrl && (
                    <PlayButton
                      $playing={playingId === song._id}
                      onClick={(e) => handlePlay(e, song)}
                    >
                      {playingId === song._id ? '\u25A0' : '\u25B6'}
                    </PlayButton>
                  )}
                  {song && isPublished(song._id) && <PublishedDot />}
                </div>
                {song && (
                  <SongInfo>
                    <Artist>{(song.artist || '').length > 15 ? song.artist.slice(0, 15) + '...' : song.artist}</Artist>
                    <SongTitle>{song.name}</SongTitle>
                  </SongInfo>
                )}
              </DayCell>
            )
          })}
        </Grid>
      )}

      {view === 'list' && !loading && (
        <>
          {pastCount > 0 && (
            <ShowPastButton onClick={() => setShowPast((v) => !v)}>
              {showPast
                ? 'Hide past songs'
                : `Show ${pastCount} past song${pastCount === 1 ? '' : 's'}`}
            </ShowPastButton>
          )}
          <ListContainer>
            {visibleSongs.map((song) => (
              <ListRow key={song._id} onClick={() => handleSongClick(song)}>
                <ListDate>{formatDate(song.datetime)}</ListDate>
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
  )
}
