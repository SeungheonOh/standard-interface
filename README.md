# Standard Interfaces

The Ataxia website at https://standard-interface.com.

## Local development

Use Node.js 22.13 or newer, then run:

```sh
npm ci
npm run dev
```

The site uses React, TypeScript, Vinext, and Cloudflare-compatible output.
`npm run build` produces the deployment bundle. Sites publishes the project
identified in `.openai/hosting.json`; no credentials belong in this repository.

## Structure

- `app/page.tsx`: page content and source links.
- `app/globals.css`: monochrome theme, responsive layout, and stepped motion.
- `components/workspace.tsx`: interactive browser model of the desktop.
- `components/ui`: generated UI primitives, composed by the site.

The browser model demonstrates arranging windows, adding a choice widget, and
changing typography. It is not connected to Ataxia or an agent. Actual compositor
source and live-image instructions are in https://github.com/SeungheonOh/ataxia.

Type checking: `npx tsc --noEmit`. Site-specific lint:
`npx oxlint app components/workspace.tsx`. The scaffold's full lint command also
checks generated UI primitives with pre-existing lint findings.

Source is maintained on `master` at
https://github.com/SeungheonOh/standard-interface.
