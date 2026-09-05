# Standard Interface

The Standard Interface homepage at https://standard-interface.com.
The Ataxia project page lives at https://standard-interface.com/ataxia.

The header and favicon share the outlined SVG in
`public/brand/standard-interface-mark.svg`. Reusable artwork and a PNG export
are maintained at https://github.com/std-Interface/branding.

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

- `app/page.tsx`: minimal company homepage and link to Ataxia.
- `app/ataxia/page.tsx`: Ataxia content, interactive examples, and source links.
- `app/globals.css`: high-contrast theme, responsive layout, and restrained motion.
- `components/workspace.tsx`: interactive canvas with an in-world agent terminal.
- `components/infinite-canvas.tsx`: open-canvas navigation, project grouping, and task widgets.
- `components/world-layouts.tsx`: tiling, scrolling columns, and an orbital world with persistent objects.
- `components/direct-input.tsx`: object inspection and pointer/keyboard delivery into a working search form.
- `components/demos.tsx`: accessible tabs between the four examples.
- `components/disorder-line.tsx`: rotating hero phrase with hover personalization.
- `components/ui`: generated UI primitives, composed by the site.

The hero cycles through form, structure, harmony, coherence, pattern, and creation
every 2.4 seconds. Hover or keyboard focus changes it to “From disorder comes
your …”. Activate the
line to pause or resume; rotation also stops offscreen, in hidden tabs, and with
reduced motion enabled. Word widths are reserved to keep the layout still.
Word changes briefly select the outgoing word, then replace it character by
character behind a text cursor. Hover and focus type the “your” insertion;
the text itself never slides or fades. Only “your” uses
the dark magenta (`#721045`) from the
[Modus Operandi palette](https://github.com/protesilaos/modus-themes/blob/main/modus-themes.el).
All effects stop under reduced motion; controls stay monochrome.

The demo is a browser model, not a screenshot, live agent, or VM connection.
Its terminal and reference window share one canvas. Drag either title bar, or
focus it and use the arrow keys; Shift moves farther. The agent request inspects
the current model coordinates and adds an in-world choice widget. Approving
arranges the existing windows; cancelling preserves their positions. Reset
clears the interaction. Narrow screens use a stacked layout.

The open plane is one example of a world, not a requirement of Ataxia. The page
also describes tiling, scrolling columns, and custom geometry as possible world
representations. Drag any window's title to move it independently, including
agent-created widgets. Arrow keys move the focused window; Shift moves farther.
Movement accounts for viewport zoom, and releasing a drag does not recenter the
camera. Drag empty space to pan; click a title to focus it. Agent
requests find compositor-related objects without moving them, group windows by
project, or add a task widget to the same world. Its checkboxes return modeled
events to the in-canvas agent. Repeated creation finds the existing widget;
reset restores the six original objects and camera.

The harnesses use subtle dark text cues: navy for calls, rust for input, and
green for results. Controls, borders, and backgrounds stay monochrome; status
text and tool names carry the meaning without relying on color.

The world-rules example preserves the same three object IDs and scratchpad
contents across tiling, scrolling columns, and a ring in depth. The arrow
controls change the main pane or viewpoint. These are illustrative world
definitions, not claims that every layout is a built-in Ataxia mode.

The direct-input example measures the displayed application bounds, resolves a
surface-local pointer position, types a chosen query, and submits a real local
search. Run the sequence or step through each operation. User typing interrupts
the agent; Pause and Reset cancel pending steps. The trace abbreviates Ataxia's
object and `interactable-*` interfaces. It does not evaluate Lisp, deliver OS
input, inspect browser internals, or connect to the user's desktop. A Wayland
compositor exposes surfaces and input delivery, not arbitrary client DOM/state.

The illustrated `agent-inspect`, `agent-apply`, and `wait-for-agent-events` flow
comes from Ataxia's actual SLY interfaces, checked against the running VM. The
browser performs no Lisp evaluation, model inference, or remote desktop access.
Actual compositor source and live-image instructions are at
https://github.com/SeungheonOh/ataxia.

Type checking: `npx tsc --noEmit`. Site-specific lint:
`npx oxlint app components/workspace.tsx components/infinite-canvas.tsx components/demos.tsx components/disorder-line.tsx components/world-layouts.tsx components/direct-input.tsx`.
The scaffold's full lint command also
checks generated UI primitives with pre-existing lint findings.

Source is maintained on `master` at
https://github.com/SeungheonOh/standard-interface.
