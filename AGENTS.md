# AGENTS.md

## Project purpose

TrigLab is an interactive, browser-based trigonometry visualizer. It was motivated by crash-reconstruction work involving longitudinal and lateral Delta-V components, resultant vectors, and direction calculations. The central product principle is: help the learner see **why** a relationship works, not merely obtain a numerical answer.

This is educational software, not validated forensic software. Never imply that a generic mathematical angle automatically matches a particular PDOF convention. EDR systems, SAE or other standards, vehicle coordinate systems, manufacturers, reporting practices, and agency procedures may differ.

## Durable constraints

- The application must remain entirely client-side and static.
- It must build to assets that GitHub Pages can serve under a repository subpath.
- Do not add a backend, database, authentication, secrets, or required APIs.
- Preserve accessible labels and non-color cues; color reinforces meaning but is never the only cue.
- Keep desktop, laptop, touch, and iPad/tablet layouts usable.
- Use the same palette everywhere a quantity appears: X blue, Y coral/red, resultant green, angle amber.
- Prefer one focused educational relationship at a time over a crowded calculator interface.

## Stack and architecture

The project uses Vite, TypeScript, native HTML/CSS, and SVG. A framework was intentionally omitted: the application has a compact canonical vector state and one interactive view, while native SVG provides precise, accessible geometry with minimal runtime weight. Vitest covers pure calculations and browser-like interface behavior through jsdom. Vite's relative base produces GitHub Pages-compatible asset URLs.

- `src/math/` contains pure, DOM-independent math. Never couple these functions to SVG or interface state.
- `src/main.ts` owns the canonical vector state and synchronizes dragging, component entry, angle entry, and lesson modes.
- `src/ui/` owns lesson definitions, educational copy, and live value mapping.
- SVG/visual rendering belongs in dedicated rendering functions or modules, separate from pure math.
- Educational copy belongs near the interface that presents it, not inside mathematical functions.
- `.github/workflows/` owns deployment configuration.

The canonical vector state is `{ x, y }`. Magnitude, direction, sine, cosine, tangent, inverse relationships, and SVG positions are derived. Dragging, keyboard control, component entry, angle entry, and angle sliders must update the same canonical state so controls never drift out of sync. Unit-circle mode temporarily fixes magnitude at one and restores the prior magnitude when the user leaves that lesson.

## Mathematical expectations

- Use `Math.atan2(y, x)` for a quadrant-aware direction.
- Treat `(0, 0)` as having no defined direction.
- Treat sine and cosine as undefined for the zero vector because there is no hypotenuse to divide by.
- Treat tangent as undefined when X is zero or effectively zero; explain "rise but no run" rather than rendering `Infinity` or `NaN`.
- Explain that `asin`, `acos`, and `atan` return principal ranges and do not independently reconstruct every quadrant.
- Test all four quadrants, axes, 0°/90°/180°/270°/360°, normalization, floating-point tolerance, and the ambiguity of `atan(y / x)`.
- Keep the standard math convention explicit: 0° is +X and positive rotation is counterclockwise.
- Delta-V mode relabels generic signed components but does not convert the mathematical direction into an assumed PDOF convention. Keep its convention card, source link, and forensic-use disclaimer visible.

## Commands

```sh
npm install      # install dependencies
npm run dev      # local development server
npm test         # unit tests
npm run build    # production build in dist/
npm run preview  # preview the production build
```

Deployment runs through the GitHub Pages workflow after changes reach the default branch. Keep paths relative and do not introduce root-only asset assumptions.

## Coding conventions

- TypeScript strict mode stays enabled.
- Prefer small pure functions and explicit names over clever abstractions.
- Keep rendering deterministic from state.
- Round only for presentation; calculations use unrounded values.
- Preserve visible focus styles, semantic controls, large pointer targets, keyboard operability where practical, and reduced-motion preferences.
- All focused lessons must preserve non-color cues: side names, distinct line directions, labels, and direct equations.
- Verify narrow layouts without shrinking the diagram or text into illegibility.
- Update this file only for durable architectural or project-policy changes; use Git history for implementation chronology.
