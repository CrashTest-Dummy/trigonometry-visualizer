# TrigLab — Interactive Trigonometry Visualizer

TrigLab is a browser-based educational tool for rebuilding geometric intuition about trigonometry. Its first lesson connects a draggable vector and right triangle to tangent, inverse tangent, and `atan2()` quadrant handling.

The project was motivated by crash-reconstruction vector work, especially understanding how longitudinal and lateral Delta-V components combine into a resultant direction. It is an educational aid, not validated forensic software.

## First milestone

- Draggable vector endpoint across all four quadrants
- Color-linked X, Y, resultant, and angle values
- Live tangent and inverse-tangent reasoning
- Clear comparison of `atan(y / x)` and `atan2(y, x)`
- Direct X and Y entry, touch support, and responsive layout
- Static production output suitable for GitHub Pages

## Development

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Run the math tests and create a production build:

```sh
npm test
npm run build
```

## Deployment

The Vite build uses relative asset paths so the site works under a repository subpath. A GitHub Actions workflow publishes the `dist/` directory to GitHub Pages on updates to the default branch.

In the GitHub repository, set **Settings → Pages → Source** to **GitHub Actions** if it is not selected automatically.

## Project structure

```text
src/math/       Pure, DOM-independent calculations
src/            UI state, SVG rendering, and styling
tests/          Mathematical unit tests
.github/        GitHub Pages deployment workflow
```

## Coordinate convention and disclaimer

TrigLab uses the standard mathematical convention: 0° is positive X, and positive angles rotate counterclockwise. Crash-reconstruction PDOF conventions may differ among EDR systems, standards, manufacturers, agencies, and vehicle coordinate systems. Do not silently treat the displayed angle as a case-specific PDOF. Actual reconstruction work should follow validated tools, applicable standards, agency procedures, manufacturer documentation, and EDR documentation.

