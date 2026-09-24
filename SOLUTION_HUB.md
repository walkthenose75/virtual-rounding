# Solution Hub — Submission Draft (Virtual Rounding)

Ready-to-paste values for the Solution Hub "Submit a Solution" form. Review before submitting.

## Fields

- **Solution Title:** Virtual Rounding
- **Industry:** Providers
- **GitHub Repository URL:** https://github.com/walkthenose75/virtual-rounding
- **Live Demo Environment URL:** _optional — leave blank; the deliverable is an installable
  unmanaged solution_
- **Content Type:** Demo Assets, Architecture Pattern
- **Technical Areas:** Power Platform, Power Apps (code apps), Dataverse, Microsoft Teams
- **Contributors:** _<add co-authors>_

## Describe Your Solution (narrative)

Virtual Rounding is a modern reimagining of the classic Microsoft Health & Life Sciences
virtual rounding scenario. Care providers browse patient rooms by location and unit, see room
status and the current patient at a glance, and join a room's Microsoft Teams meeting in one
click — now delivered as a **Power Apps code app on Microsoft Dataverse** instead of canvas apps
over SharePoint lists.

Highlights:

- **Provider rounding console** — rooms grouped by hospital and unit, with live status
  (Available / Occupied / Needs Reset), current patient, and family-invite indicators.
- **One-click join** to the room's Teams meeting.
- **Dataverse data model** (Location → Sub Location → Room) replacing SharePoint lists, giving a
  relational schema, choices, and security.
- **Microsoft Teams ready** — packaged as a personal tab.
- **Installable unmanaged solution** any SE can import, demo, and customize; ships with a
  coherent, fictitious synthetic dataset (no real patient data).

Built with the Power Platform Reimagined kit: an evidence-based, gated workflow that documents a
legacy solution, designs a modern target, builds it inside a named unmanaged solution on your
tenant, and packages it for sharing.

## How to demo

See `DEMO_SCRIPT.md`.

## Assets included in the repo

- `src/` — code app source (React + Vite)
- `solution/VirtualRounding.zip` + unpacked source — Dataverse schema (unmanaged)
- `data/*.csv` + seed script — fictitious synthetic demo data
- `teams/` — Teams personal-tab manifest template + package builder
- `docs/` — current-state and target architecture, process notes
- `INSTALL.md` — three-step install
