# Upgrade: Real Teams Meeting Creation (production fidelity)

The shipped demo issues a fresh **placeholder** meeting link on **Reset** to keep install
friction low (only the Office 365 Outlook connection is required). This guide adds **real**
Microsoft Teams meeting creation, matching the original Virtual Rounding solution, which used
Microsoft Graph `POST /communications/onlinemeetings` from a Power Automate flow.

## Why a flow (not the client app)

Creating a Teams meeting owned by the **patient-room account** needs Microsoft Graph
**application** permission `OnlineMeetings.ReadWrite.All` and a **client secret**. Secrets must
never live in a client-side code app, so the Graph call belongs in a **server-side cloud flow**.
The code app calls the flow; the flow holds the secret.

## Prerequisites (one-time, admin)

1. **App registration** (Entra ID):
   - New registration → note **Application (client) ID** and **Directory (tenant) ID**.
   - **API permissions** → Microsoft Graph → **Application permissions** →
     `OnlineMeetings.ReadWrite.All` (and `Calendars.ReadWrite` if updating calendar events) →
     **Grant admin consent**.
   - **Certificates & secrets** → new client secret → note the value.
2. (For room-as-organizer) An **application access policy** so the app can create meetings on
   behalf of the room accounts:
   `New-CsApplicationAccessPolicy` + `Grant-CsApplicationAccessPolicy` (Teams PowerShell).

## Build the flow

Create a solution-aware cloud flow **Create Room Meeting** in the Virtual Rounding solution:

1. **Trigger:** *When an HTTP request is received* (or a PowerApps V2 trigger). Input: `roomId`.
2. **Get room** (Dataverse): read `sh_room` by id → `sh_roomupn`, `sh_eventid`.
3. **Create meeting** (HTTP → Graph):
   - `POST https://graph.microsoft.com/v1.0/users/<sh_roomupn>/onlineMeetings`
   - Auth: **Active Directory OAuth** — authority `https://login.microsoftonline.com`, tenant =
     Directory ID, audience `https://graph.microsoft.com`, client ID + secret from the app reg.
   - Body: `{ "startDateTime": "<now>", "endDateTime": "<now + 60 days>", "subject": "Virtual Rounding" }`
   - Parse the response `joinUrl`.
4. **Update room** (Dataverse): `sh_meetinglink = joinUrl`, `sh_patientname = ""`,
   `sh_sharedwith = 0`, `sh_lastreset = utcNow()`, `sh_status = 1` (Available).
5. **Respond** with `{ "joinUrl": "<joinUrl>" }`.

## Wire the code app

Because `pac code` doesn't add a flow data source, call the flow's HTTP trigger URL from the
`reset` action:

```ts
const res = await fetch(RESET_FLOW_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ roomId: r.sh_roomid })
})
const { joinUrl } = await res.json()
await load()
```

Store `RESET_FLOW_URL` in a Dataverse **environment variable** (recommended) rather than
hard-coding it. Then remove the placeholder-link logic in `reset`.

> The HTTP trigger URL contains a SAS signature. Prefer a PowerApps-triggered flow or an
> authenticated endpoint if exposing the URL to clients is a concern.

## Alternative: Microsoft Teams connector

If you don't need room-as-organizer fidelity, add the **Microsoft Teams** connector and use its
meeting-creation action (delegated, no app registration). Verify the action returns a join web
URL in your tenant before relying on it.

## Reference

The original flow logic is captured in [current-state-behavior.md](current-state-behavior.md).
