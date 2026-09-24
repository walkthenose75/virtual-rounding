# Virtual Rounding

A modern, installable demo of provider **virtual rounding**, reimagined as a **Power Apps code
app** on **Microsoft Dataverse** and ready to run as a **Microsoft Teams** personal tab.

Care providers browse patient rooms by hospital and unit, see room status and the current
patient at a glance, identify a patient, **invite a family member by real email**, reset a room,
and join the room's Teams meeting.

> Reimagined from the classic Microsoft Health & Life Sciences *Virtual Rounding* solution
> (SharePoint lists + canvas apps + Power Automate) into a modern **code app + Dataverse**
> architecture. Built with the [Power Platform Reimagined](https://github.com/walkthenose75/power-platform-reimagined) kit.

## What's inside

| Path | Contents |
|---|---|
| `app/` | Code app source (React + Vite) |
| `solution/` | Unmanaged solution (`VirtualRounding.zip` + unpacked source) — Dataverse schema + connection reference |
| `data/` | Fictitious synthetic demo data (CSV) + seed script |
| `teams/` | Teams personal-tab manifest template + package builder |
| `docs/` | Current-state data model & behavior, target architecture, and the real-Teams-meetings upgrade |
| `INSTALL.md` | Three-step install (incl. the Office 365 connection for real email) |
| `DEMO_SCRIPT.md` | ~4-minute demo walkthrough |
| `SOLUTION_HUB.md` | Solution Hub submission metadata |

## Features

- **Rounding console** — rooms grouped by hospital → unit, with live status and current patient.
- **Set patient** — identify the patient in a room (Dataverse write).
- **Invite family** — sends a **real email** (Office 365 Outlook connector) with the join link and
  tracks the share count.
- **Reset room** — clears the patient, revokes invites, and issues a fresh meeting link.
- **Join** — opens the room's Teams meeting.

## Quick start

See **[INSTALL.md](INSTALL.md)**. In short: import the solution → create an Office 365 Outlook
connection → `pac code push` → seed the synthetic data.

## Optional: real Teams meeting creation

The shipped demo issues a fresh placeholder link on reset (least install friction). To create
**real** Teams meetings (as the original did, via Microsoft Graph), see
**[docs/upgrade-real-teams-meetings.md](docs/upgrade-real-teams-meetings.md)**.

## Disclaimer

This is a **sample/demo**. All data is **synthetic and fictitious** — no real patient
information is included. Not intended for clinical use.

## License

[MIT](LICENSE).
