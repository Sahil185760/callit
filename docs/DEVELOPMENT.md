# Development and hosting

## Local database

The README builds the Worker configuration before applying the initial D1 migration. Apply migrations only to a fresh local database or when they have not yet been applied. Local state lives in ignored `.wrangler/` files. No production database records are included.

## Authentication

Portable development provides a loopback-only mock identity through `/signin-with-chatgpt?return_to=/`. Use `/signout-with-chatgpt?return_to=/` to end that session. This is a development convenience, not a production identity provider.

Production Sites dispatch supplies trusted identity headers used by `app/chatgpt-auth.ts`. A standalone deployment must implement a trusted authentication boundary and prevent visitors from spoofing identity headers. Uploading this repository to GitHub does not deploy an authentication service or database.

## Deployment

The app contains server routes and D1 persistence, so GitHub Pages alone cannot run it. The existing demo runs on ChatGPT Sites. To publish a separate Sites instance, register your own project and configure its identifier in `.openai/hosting.json`; this export retains the logical DB declaration but omits the original project identifier. Alternative Workers hosting requires its own D1 binding, migrations, and authentication integration.

## Storage design

The game is stored as a JSON document in a single D1 row. Mutations use a revision condition and retry up to six times to prevent conflicting writes from silently overwriting one another. This is a compact design for small leagues; larger deployments would benefit from normalized tables and more granular transactions.

## Export changes

The export preserves the application from source commit `1c90ec9`, with professional documentation, focused tests, package naming, removal of the original deployment identifier, and removal of a one-time owner-specific coin grant and its private player identifier. These export changes do not modify the running Site.

## Verification scope

The export's pricing and settlement tests were run locally. A fresh dependency installation, full application build, and end-to-end authentication test were not performed for this publication. The complete pinned dependency lockfile is included for reproducible installation.
