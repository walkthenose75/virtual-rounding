import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { Sh_roomsService } from './generated/services/Sh_roomsService'
import type { Sh_rooms, Sh_roomsBase } from './generated/models/Sh_roomsModel'

type Room = Sh_rooms

const STATUS_LABELS: Record<number, string> = { 1: 'Available', 2: 'Occupied', 3: 'Needs Reset' }
const STATUS_CLASS: Record<number, string> = { 1: 'available', 2: 'occupied', 3: 'reset' }

function App() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await Sh_roomsService.getAll({ orderBy: ['sh_name asc'] })
      setRooms(res.data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const join = (r: Room) => {
    if (r.sh_meetinglink) window.open(r.sh_meetinglink, '_blank', 'noopener')
  }

  const setStatus = async (r: Room, status: 1 | 2 | 3) => {
    const changed: Partial<Omit<Sh_roomsBase, 'sh_roomid'>> = { sh_status: status }
    if (status === 1) changed.sh_patientname = ''
    await Sh_roomsService.update(r.sh_roomid, changed)
    await load()
  }

  const locName = (r: Room) => r.sh_locationidname ?? 'Unassigned'
  const subName = (r: Room) => r.sh_sublocationidname ?? '—'
  const locations = [...new Set(rooms.map(locName))].sort()
  const subsFor = (loc: string) =>
    [...new Set(rooms.filter((r) => locName(r) === loc).map(subName))].sort()
  const roomsFor = (loc: string, sub: string) =>
    rooms.filter((r) => locName(r) === loc && subName(r) === sub)

  const total = rooms.length
  const occupied = rooms.filter((r) => r.sh_status === 2).length
  const needsReset = rooms.filter((r) => r.sh_status === 3).length

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">◉</span>
          <div>
            <h1>Virtual Rounding</h1>
            <p>Provider console</p>
          </div>
        </div>
        <div className="stats">
          <div className="stat"><b>{total}</b><span>Rooms</span></div>
          <div className="stat"><b>{occupied}</b><span>Occupied</span></div>
          <div className="stat"><b>{needsReset}</b><span>Needs reset</span></div>
          <button className="refresh" onClick={() => void load()} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </header>

      {error && <div className="error">Couldn’t load rooms: {error}</div>}
      {!loading && total === 0 && !error && <div className="empty">No rooms found.</div>}

      <main>
        {locations.map((loc) => (
          <section key={loc} className="location">
            <h2>{loc}</h2>
            {subsFor(loc).map((sub) => (
              <div key={sub} className="sublocation">
                <h3>{sub}</h3>
                <div className="grid">
                  {roomsFor(loc, sub).map((r) => {
                    const status = (r.sh_status ?? 1) as number
                    return (
                      <article key={r.sh_roomid} className={`room ${STATUS_CLASS[status]}`}>
                        <div className="room-head">
                          <span className="room-name">{r.sh_name}</span>
                          <span className={`badge ${STATUS_CLASS[status]}`}>{STATUS_LABELS[status]}</span>
                        </div>
                        <div className="patient">
                          {r.sh_patientname ? r.sh_patientname : <em>Vacant</em>}
                        </div>
                        <div className="room-actions">
                          <button className="join" onClick={() => join(r)} disabled={!r.sh_meetinglink}>
                            Join
                          </button>
                          {status === 1 && <button onClick={() => void setStatus(r, 2)}>Occupy</button>}
                          {status !== 1 && <button onClick={() => void setStatus(r, 1)}>Reset</button>}
                          {status !== 3 && <button onClick={() => void setStatus(r, 3)}>Flag</button>}
                        </div>
                        {r.sh_shareexternally && (
                          <div className="shared">Family invited · {r.sh_sharedwith ?? 0}</div>
                        )}
                      </article>
                    )
                  })}
                </div>
              </div>
            ))}
          </section>
        ))}
      </main>
    </div>
  )
}

export default App
