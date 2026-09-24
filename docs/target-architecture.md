# Virtual Rounding — Target Architecture (draft)

Status: **proposed** (architecture gate). Target surface: **Power Apps code app**, intended
to run in **Microsoft Teams** as a custom personal tab. Data platform: **Dataverse**
(replacing the SharePoint list). Canvas apps are retired; not rebuilt.

## Why this shape

- Model-driven-in-Teams is deprecated (no new apps; stops working after 2026-05-01), so a
  code app is the forward-looking Teams surface.
- Code apps are Entra-authenticated web apps with Dataverse + 1,500+ connectors from
  JavaScript; they can be embedded in Teams as a custom personal tab (Teams JS SDK + SSO).
- Dataverse gives a relational model, choices, security roles, and audit vs. text-flag columns.

## Dataverse data model (proposed)

- **Location** — name.
- **SubLocation** — name, Location (lookup).
- **Room** — name, Room UPN, Location (lookup), SubLocation (lookup), Meeting Link (URL),
  Event ID, Patient Name, Status (choice: Available / Occupied / Needs Reset), Share
  Externally (yes/no), Shared With (count), Last Share (datetime), Last Reset (datetime).

(Optional later: RoundingSession / VisitLog for history; Provider as Dataverse user/team.)

## Code app experience (provider-first MVP)

1. **Rooms** — list/grid grouped by Location → SubLocation; shows patient + status; search/filter.
2. **Room detail** — patient, status, meeting link; actions: **Join** (Teams deep link),
   **Reset room**, **Invite family/friend** (external share).
3. **Teams-aware** — Teams JS SDK for context/SSO; Join opens the meeting in Teams.

Patient one-click-join (kiosk) can be a later, focused view or separate lightweight surface.

## Connectors / integration (to validate against target env)

- **Dataverse** — system of record (via generated code-app services).
- **Office 365 Outlook** — external invite emails (replaces SendGrid step) — candidate.
- **Meeting create/reset** — currently Graph via Power Automate. Options to evaluate:
  keep a cloud flow, or call Graph via a connector/custom connector. MVP can consume an
  existing Meeting Link and defer automated creation.

## Teams packaging

- Deploy code app → capture app URL.
- Author a Teams app manifest (personal tab, `staticTabs[].contentUrl` → code-app URL).
- Handle Teams SSO; validate iframe embedding and Entra auth inside Teams.

## Out of scope for MVP

- Rebuilding PowerShell room-account provisioning (kept as-is / documented).
- Full automated Teams meeting lifecycle (phase 2).
- FHIR/patient-experience features from the separate 2023 solution (different product).

## Open decisions

- Target Power Platform environment (needed to init/deploy). **Pending from user.**
- Whether meeting creation/reset is in-app (connector) or remains a flow.
- External-invite channel (Office 365 Outlook vs. existing mail platform).
