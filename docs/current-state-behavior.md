# Virtual Rounding — Real Behavior (from unpacked .msapp + flows)

Source: `v2/PowerApps/VirtualRounding_*.zip` → unpacked `.msapp` (Power Fx) + 2 embedded flows.
This is the authoritative behavior the reimagined app must replicate (previously reconstructed
from docs only — corrected here after unpacking the actual package).

## Provider app screens (Power Fx)

- **RoomSelector** (home): pick Location + SubLocation; gallery filtered by
  `Filter('Virtual Rounding','Room SubLocation'=… && 'Room Location'=…)`; tap a room →
  `Navigate(JoiningRoom)`; a Config button → `Navigate(Configuration)`; Refresh button.
- **JoiningRoom**: shows room + "shared with N external participant(s)";
  **Join** = `Launch(Room.MeetingLink)` then refresh + back.
- **Configuration** (the action hub):
  - **Set patient name**: `Patch('Virtual Rounding', Room, {'Patient Name': PatientName.Text})`
  - **Clear patient name**: `Patch(…, {'Patient Name': ""})`
  - **Invite family**: `ShareMeetingLink.Run(Room.ID, FamilyEmail.Text)`
  - **Reset meeting**: `ResetMeetingLink.Run(Room.ID)`
- **Complete**: confirmation; timer → back to RoomSelector.

## Flow: Share Meeting Link

1. Get room (SharePoint item).
2. **Send email** (Mail connector) to the family address — subject *"You have been invited to
   virtually visit a patient"* with a `MeetingLink&webjoin=true` link.
3. **Update room**: `SharedWith = SharedWith + 1`, `LastShare = utcNow()`.

## Flow: Reset Meeting Link

1. Get room (SharePoint item).
2. **Create a new Teams meeting** via Microsoft Graph
   `POST /communications/onlinemeetings` (organizer = room UPN, ~60‑day window) using an app
   registration (client id/secret/tenant).
3. **Update the room's calendar event** with the new join link.
4. **Update room**: new `MeetingLink`, clear `Patient Name`, `SharedWith = 0`, `LastReset = now`
   (resetting invalidates prior family invites).

## Mapping to the reimagined code app

| Original action | Reimagined (code app on Dataverse) |
|---|---|
| Browse by Location/SubLocation | Grid grouped by `sh_location` → `sh_sublocation` |
| Set/clear patient name | Update `sh_patientname` (+ derive status) |
| Join | `window.open(sh_meetinglink)` |
| Invite family (email + SharedWith+1 + LastShare) | Update `sh_sharedwith += 1`, `sh_lastshare = now` (real email via Office 365 connector — follow‑up) |
| Reset meeting (Graph new link + clear patient + SharedWith=0 + LastReset) | New placeholder link + clear patient + `sh_sharedwith=0` + `sh_lastreset=now` (real Graph meeting via flow/connector — follow‑up) |

**Parity now:** patient identification, join, invite tracking, and reset are all real Dataverse
writes with visible UI changes. **Follow‑ups for full fidelity:** actual invite email (Office
365 Outlook connector) and actual Teams meeting creation (Graph via a cloud flow or connector).
