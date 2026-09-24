# Virtual Rounding â€” Install Guide

A modern, installable demo of provider virtual rounding, reimagined as a **Power Apps code app**
on **Microsoft Dataverse**, optionally surfaced as a **Microsoft Teams** personal tab.

Because code apps are deployed from source (not packaged inside the solution zip), install is
**three steps**: import the schema, deploy the app, seed demo data.

## Prerequisites

See the kit's prerequisites guide. In short: Node 22+, Git, Power Platform CLI (`pac`), Azure
CLI (`az`), a Power Platform environment with **code apps enabled**, and maker access
(System Customizer or System Administrator).

## 1. Import the Dataverse schema (unmanaged solution)

```powershell
pac auth create --environment https://<your-org>.crm.dynamics.com/
pac solution import --path ./solution/VirtualRounding.zip --publish-changes
```

This creates the **Virtual Rounding** solution with the `sh_location`, `sh_sublocation`, and
`sh_room` tables (publisher: Smartter Health, prefix `sh`).

## 2. Deploy the code app

```powershell
cd app
npm install
az login --tenant <your-tenant-id>
npm run build
pac code push --environment https://<your-org>.crm.dynamics.com/ --solutionName VirtualRounding
```

The command prints a **play URL** â€” that's your running app.

## 3. Seed synthetic demo data

Fictitious sample data lives in `./data/*.csv`. Load it with the included script:

```powershell
./data/seed-synthetic-data.ps1 -EnvironmentUrl https://<your-org>.crm.dynamics.com
```

You should now see 2 hospitals, 3 units, and 7 rooms in the app.

## 4. (Optional) Add to Microsoft Teams

```powershell
./teams/build-teams-package.ps1 -AppId <your-app-id> -EnvironmentId <your-env-id>
```

Sideload `teams/dist/VirtualRounding-Teams.zip` via **Teams > Apps > Manage your apps > Upload a
custom app**.

> To render inside Teams, an admin must add `https://teams.microsoft.com` and
> `https://*.teams.microsoft.com` to the code app **CSP `frame-ancestors`** in
> PPAC > environment > Settings > Product > Privacy + Security > Content security policy > App.

## Teardown

Delete the unmanaged **Virtual Rounding** solution and remove the code app from the environment.

## Notes

- All sample data is **synthetic and fictitious**. No real patient information is included.
- The original solution (SharePoint lists + canvas apps + Teams meeting automation) is documented
  in `docs/` for context.

