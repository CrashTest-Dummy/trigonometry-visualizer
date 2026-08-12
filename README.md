# TrigLab — Interactive Trigonometry Visualizer

TrigLab is a browser-based educational tool for rebuilding geometric intuition about trigonometry. A single draggable vector connects geometry to live ratios, trig functions, inverse functions, quadrant-aware angles, unit-circle coordinates, and real-world component problems.

The project was motivated by crash-reconstruction work involving longitudinal and lateral Delta-V components. It is an educational aid, not validated forensic software.

## Lessons and interactions

- Triangle basics and the Pythagorean relationship
- Sine as vertical share: opposite ÷ hypotenuse
- Cosine as horizontal share: adjacent ÷ hypotenuse
- Tangent as slope: rise ÷ run
- Arcsine, arccosine, and arctangent principal-angle behavior
- `atan(y / x)` ambiguity versus quadrant-aware `atan2(y, x)`
- Unit circle with radius fixed to one, where `x = cos(θ)` and `y = sin(θ)`
- Delta-V / PDOF connection with longitudinal, lateral, resultant, and direction calculations

The vector can be changed by dragging its endpoint, using the keyboard, entering X and Y components, moving the angle slider, entering an angle, or choosing a special-angle shortcut. Angles can be shown as 0–360° or −180–180°.

Every lesson uses the same visual language: X is blue, Y is coral, the resultant is green, and the angle is amber. Relevant sides remain emphasized while unused geometry is visibly subdued.

## Development

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Run the pure-math and browser-like interface tests, then create a production build:

```sh
npm test
npm run build
```

## Deployment

The Vite build uses relative asset paths so the site works under a GitHub Pages repository subpath. [The GitHub Actions workflow](.github/workflows/deploy-pages.yml) runs the complete test suite, builds the static assets, and deploys `dist/` whenever `main` changes.

If configuring a fork, select **Settings → Pages → Source → GitHub Actions**.

## Project structure

```text
src/math/             Pure DOM-independent calculations
src/ui/               Lesson definitions, educational copy, and live value mapping
src/visualization/    SVG geometry and relationship emphasis
src/main.ts           Canonical vector state and synchronized interaction wiring
tests/                Math and browser-like interface tests
.github/workflows/    GitHub Pages deployment
```

## Coordinate convention and disclaimer

General lessons use the standard mathematical convention: 0° is positive X and positive angles rotate counterclockwise. Delta-V mode intentionally preserves that same display and does **not** silently convert the result into a case-specific PDOF.

For comparison, [49 CFR §563.5](https://www.govinfo.gov/link/cfr/49/563?link-type=pdf&sectionnum=5&year=mostrecent) defines EDR longitudinal acceleration as positive forward and lateral acceleration as positive from the driver’s left to right. EDR systems, standards, manufacturers, agencies, and reporting conventions may still differ in how direction is expressed or transformed.

Actual reconstruction work should follow validated tools, applicable standards, agency procedures, manufacturer documentation, and the relevant EDR documentation.

