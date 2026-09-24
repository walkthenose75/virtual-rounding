# Virtual Rounding — Current-State Data Model & Behavior

Source: `SmartterHealth/Virtual-Rounding` @ `ce99ae8` (v2). Confidence: **observed** from
repo artifacts (`SetupSPO.ps1`, sample CSVs, README, PowerApps.md). Runtime config
(actual connections, tenant values) is **unknown** from a repository-only source.

## Master data store: SharePoint list "Virtual Rounding"

Created by `v2/Scripts/SetupSPO.ps1` (PnP PowerShell). Content type `VirtualRoundingRoom`.

| Internal name | Display name | Type | Purpose (inferred) |
|---|---|---|---|
| Title | Title | Text | Room name (default column) |
| RoomLocation | Room Location | Text | Building/location |
| RoomSubLocation | Room SubLocation | Text | Floor/unit |
| MeetingLink | Meeting Link | URL | Teams meeting join URL for the room |
| EventID | EventID | Text | Graph calendar event id for the room's meeting |
| Share Externally | Share Externally | Text | Flag/trigger to invite family/friends |
| Reset Room | Reset Room | Text | Flag/trigger to reset the room's meeting |
| LastReset | Last Reset | DateTime | When meeting was last reset |
| SharedWith | Shared With | Number | Count of external invites sent |
| LastShare | Last Share | DateTime | When last external invite was sent |
| RoomUPN | Room UPN | Text | Entra account UPN for the room device |
| Patient Name | Patient Name | Text | Current patient in the room |

## Supporting reference data (sample CSVs)

- `LocationList.csv`: LocationName, MembersGroupName
- `SubLocationList.csv`: LocationName, LocationSubname
- `RoomAccounts.csv`: AccountName, AccountUPN, AccountPassword, AccountLocation, AccountSubLocation

Location → SubLocation → Room is a two-level hierarchy.

## Components

- **Canvas app — Virtual Rounding (Provider):** browse rooms, join meeting, reset room,
  invite family/friends; bound to the SharePoint list.
- **Canvas app — Patient Join:** one-click join for the patient-room kiosk device.
- **Power Automate flows:** Reset Meeting Link, Share Meeting Link, SetupRoomMeetings,
  AddMeetingBot — call Microsoft Graph (Calendars.ReadWrite, OnlineMeetings.ReadWrite.All,
  Group.ReadWrite.All) to create/reset long-running Teams meetings.
- **PowerShell setup:** CreateRooms.ps1 (Entra room accounts + Teams policies), SetupSPO.ps1
  (site/list/columns).
- **Identity/Teams:** per-room Entra accounts, Teams kiosk mode, restrictive Teams policies,
  Azure AD app registration for Graph.

## Data lineage (inferred)

Provider/Patient canvas app ⇄ SharePoint list ⇄ Power Automate ⇄ Microsoft Graph ⇄ Teams
meeting. Patient identity/room mapping originates from admin-provisioned CSVs and scripts.

## Key behaviors to preserve

1. Browse rooms grouped by Location/SubLocation.
2. See current patient + room status.
3. Join a room's Teams meeting via its join link.
4. Reset a room's meeting (new link, clear patient).
5. Invite family/friends to a room's meeting (external share), with audit (SharedWith/LastShare).

## Known limitations in the current design (from README)

- Per-room Entra accounts + manual PowerShell/CSV provisioning.
- SharePoint list as the system of record (flags-as-text columns triggering flows).
- 24-hour meeting timeout requires daily rejoin.
- PHI-exposure caveats around provider meeting features and directory browsing.
