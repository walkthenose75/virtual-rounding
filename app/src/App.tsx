import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { Sh_roomsService } from './generated/services/Sh_roomsService'
import type { Sh_rooms, Sh_roomsBase } from './generated/models/Sh_roomsModel'
import { Office365OutlookService } from './generated/services/Office365OutlookService'

type Room = Sh_rooms

const STATUS = { AVAILABLE: 1, OCCUPIED: 2, NEEDS_RESET: 3 } as const
const STATUS_LABEL: Record<number, string> = { 1: 'Available', 2: 'Occupied', 3: 'Needs Reset' }
const STATUS_CLASS: Record<number, string> = { 1: 'available', 2: 'occupied', 3: 'reset' }

function nowIso(): string {
  return new Date().toISOString()
}

function App() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [patientDraft, setPatientDraft] = useState('')
  const [emailDraft, setEmailDraft] = useState('')

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

  const flash = (kind: 'ok' | 'err', text: string) => {
    setToast({ kind, text })
    window.setTimeout(() => setToast(null), 3500)
  }

  const selected = useMemo(
    () => rooms.find((r) => r.sh_roomid === selectedId) ?? null,
    [rooms, selectedId]
  )

  const openRoom = (room: Room) => {
    setSelectedId(room.sh_roomid)
    setPatientDraft(room.sh_patientname ?? '')
    setEmailDraft('')
  }
  const closeRoom = () => setSelectedId(null)

  // --- actions (Dataverse writes) ---
  const apply = async (id: string, changes: Partial<Omit<Sh_roomsBase, 'sh_roomid'>>, okMsg: string) => {
    setBusy(true)
    try {
      const res = await Sh_roomsService.update(id, changes)
      if (!res.success) throw res.error ?? new Error('Update failed')
      await load()
      flash('ok', okMsg)
    } catch (e) {
      flash('err', e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const savePatient = (r: Room) =>
    apply(
      r.sh_roomid,
      { sh_patientname: patientDraft.trim(), sh_status: patientDraft.trim() ? STATUS.OCCUPIED : STATUS.AVAILABLE },
      patientDraft.trim() ? `Patient set for ${r.sh_name}` : `Patient cleared for ${r.sh_name}`
    )

  const join = (r: Room) => {
    if (r.sh_meetinglink) window.open(r.sh_meetinglink, '_blank', 'noopener')
    else flash('err', 'No meeting link on this room yet — reset the room to create one.')
  }

  const invite = async (r: Room) => {
    const email = emailDraft.trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      flash('err', 'Enter a valid email address.')
      return
    }
    setBusy(true)
    try {
      const link = r.sh_meetinglink
        ? `${r.sh_meetinglink}${r.sh_meetinglink.includes('?') ? '&' : '?'}webjoin=true`
        : ''
      const mail = await Office365OutlookService.SendEmailV2({
        To: email,
        Subject: 'You have been invited to virtually visit a patient',
        Body:
          `<p>Hello,</p>` +
          `<p>You have been invited to virtually visit a patient in our hospital. ` +
          `To visit, click the link below and follow the prompts in your browser.</p>` +
          (link ? `<p><a href="${link}">Visit Patient</a></p>` : `<p>(A meeting link will be provided by the care team.)</p>`),
        Importance: 'Normal'
      })
      if (!mail.success) throw mail.error ?? new Error('Email failed to send')
      const upd = await Sh_roomsService.update(r.sh_roomid, {
        sh_sharedwith: (r.sh_sharedwith ?? 0) + 1,
        sh_lastshare: nowIso(),
        sh_shareexternally: true
      })
      if (!upd.success) throw upd.error ?? new Error('Update failed')
      await load()
      flash('ok', `Invite emailed to ${email}`)
      setEmailDraft('')
    } catch (e) {
      flash('err', e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const reset = (r: Room) =>
    apply(
      r.sh_roomid,
      {
        sh_meetinglink: `https://teams.microsoft.com/l/meetup-join/reset-${Date.now()}`,
        sh_patientname: '',
        sh_sharedwith: 0,
        sh_shareexternally: false,
        sh_lastreset: nowIso(),
        sh_status: STATUS.AVAILABLE
      },
      `${r.sh_name} reset — new meeting link, patient cleared, invites revoked`
    )

  // --- grouping ---
  const locName = (r: Room) => r.sh_locationidname ?? 'Unassigned'
  const subName = (r: Room) => r.sh_sublocationidname ?? '—'
  const locations = [...new Set(rooms.map(locName))].sort()
  const subsFor = (loc: string) =>
    [...new Set(rooms.filter((r) => locName(r) === loc).map(subName))].sort()
  const roomsFor = (loc: string, sub: string) =>
    rooms.filter((r) => locName(r) === loc && subName(r) === sub)

  const total = rooms.length
  const occupied = rooms.filter((r) => r.sh_status === STATUS.OCCUPIED).length
  const needsReset = rooms.filter((r) => r.sh_status === STATUS.NEEDS_RESET).length

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
                    const status = (r.sh_status ?? STATUS.AVAILABLE) as number
                    return (
                      <button key={r.sh_roomid} className={`room ${STATUS_CLASS[status]}`} onClick={() => openRoom(r)}>
                        <div className="room-head">
                          <span className="room-name">{r.sh_name}</span>
                          <span className={`badge ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
                        </div>
                        <div className="patient">
                          {r.sh_patientname ? r.sh_patientname : <em>Vacant</em>}
                        </div>
                        {r.sh_shareexternally && (
                          <div className="shared">Family invited · {r.sh_sharedwith ?? 0}</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </section>
        ))}
      </main>

      {selected && (
        <div className="overlay" onClick={closeRoom}>
          <aside className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <div>
                <h2>{selected.sh_name}</h2>
                <p>{locName(selected)} · {subName(selected)}</p>
              </div>
              <button className="close" onClick={closeRoom}>✕</button>
            </div>

            <span className={`badge ${STATUS_CLASS[(selected.sh_status ?? 1) as number]}`}>
              {STATUS_LABEL[(selected.sh_status ?? 1) as number]}
            </span>

            <div className="field">
              <label>Patient name</label>
              <div className="inline">
                <input value={patientDraft} onChange={(e) => setPatientDraft(e.target.value)} placeholder="Enter patient name" />
                <button className="primary" disabled={busy} onClick={() => void savePatient(selected)}>Save</button>
              </div>
            </div>

            <div className="actions">
              <button className="join" disabled={busy} onClick={() => join(selected)}>Join meeting</button>
              <button disabled={busy} onClick={() => void reset(selected)}>Reset room</button>
            </div>

            <div className="field">
              <label>Invite family / friend</label>
              <div className="inline">
                <input value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} placeholder="name@example.com" />
                <button disabled={busy} onClick={() => void invite(selected)}>Send invite</button>
              </div>
              <p className="hint">Shared with {selected.sh_sharedwith ?? 0} external participant(s).</p>
            </div>

            {busy && <div className="working">Working…</div>}
          </aside>
        </div>
      )}

      {toast && <div className={`toast ${toast.kind}`}>{toast.text}</div>}
    </div>
  )
}

export default App
