# Virtual Rounding

A modern, installable demo of provider **virtual rounding**, reimagined as a **Power Apps code
app** on **Microsoft Dataverse** and ready to run as a **Microsoft Teams** personal tab.

Care providers browse patient rooms by hospital and unit, see room status and the current
patient at a glance, and join a room's Teams meeting in one click.

> Reimagined from the classic Microsoft Health & Life Sciences *Virtual Rounding* solution
> (SharePoint lists + canvas apps + Power Automate) into a modern **code app + Dataverse**
> architecture. Built with the [Power Platform Reimagined](https://github.com/walkthenose75/power-platform-reimagined) kit.

## What's inside

| Path | Contents |
|---|---|
| `app/` | Code app source (React + Vite) |
| `solution/` | Unmanaged solution (`VirtualRounding.zip` + unpacked source) — the Dataverse schema |
| `data/` | Fictitious synthetic demo data (CSV) + seed script |
| `teams/` | Teams personal-tab manifest template + package builder |
| `docs/` | Current-state and target architecture |
| `INSTALL.md` | Three-step install |
| `DEMO_SCRIPT.md` | ~4-minute demo walkthrough |
| `SOLUTION_HUB.md` | Solution Hub submission metadata |

## Quick start

See **[INSTALL.md](INSTALL.md)**. In short:

1. Import the unmanaged solution (Dataverse schema).
2. Deploy the code app from `app/` with `pac code push`.
3. Seed the synthetic demo data.

## Architecture

- **Data:** Dataverse — `Location → Sub Location → Room` (publisher prefix `sh`).
- **Experience:** Power Apps **code app** (React + Vite), Entra-authenticated.
- **Surface:** browser or **Microsoft Teams** personal tab.

## Disclaimer

This is a **sample/demo**. All data is **synthetic and fictitious** — no real patient
information is included. Not intended for clinical use. See the original Microsoft disclaimer for
the virtual rounding scenario.

## License

[MIT](LICENSE).
