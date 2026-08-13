export const GLOSSARY = [
  ["Component", "One signed part of a vector measured along a defined axis."],
  ["Resultant", "The single vector produced when perpendicular components are combined."],
  ["Vector", "A quantity with both magnitude and direction."],
  ["Ratio", "A comparison made by dividing one quantity by another."],
  ["Quadrant", "One of four regions created by the positive and negative X and Y axes."],
  ["Inverse function", "A function that reverses a trig ratio to return a principal angle."],
  ["Delta-V", "Change in velocity. Signed components depend on the reporting system’s documented axes."],
  ["PDOF", "Principal Direction of Force. Its convention must be identified rather than inferred from a generic math angle."],
] as const;

export const definitionsMarkup = (terms: readonly string[] = GLOSSARY.map(([term]) => term)): string => {
  const selected = GLOSSARY.filter(([term]) => terms.includes(term));
  return `
    <details class="definitions">
      <summary>Plain-language definitions</summary>
      <dl>${selected.map(([term, definition]) => `<div><dt>${term}</dt><dd>${definition}</dd></div>`).join("")}</dl>
    </details>
  `;
};

export const referenceMarkup = (): string => `
  <section class="reference-sheet" aria-labelledby="reference-title">
    <header class="reference-header">
      <div><p class="eyebrow">Quick reference · educational use</p><h1 id="reference-title">Vector and direction field reference</h1><p>Choose the question first. Then use the relationship that answers it.</p></div>
      <button type="button" class="print-button" data-action="print-reference"><span aria-hidden="true">⇩</span> Print reference</button>
    </header>

    <section class="reference-section question-tool" aria-labelledby="question-tool-title">
      <h2 id="question-tool-title">Question → tool</h2>
      <div class="reference-grid three-up">
        <article><p>How large is the combined vector?</p><strong class="r-text">Magnitude</strong><code>R = √(X² + Y²)</code></article>
        <article><p>Which direction do signed X and Y indicate?</p><strong class="angle-text">Direction</strong><code>θ = atan2(Y, X)</code></article>
        <article><p>What are the components of a known vector?</p><strong>Component shares</strong><code><span class="x-text">X = R cos θ</span><br/><span class="y-text">Y = R sin θ</span></code></article>
      </div>
    </section>

    <section class="reference-section convention-reference" aria-labelledby="convention-title">
      <div>
        <h2 id="convention-title">Coordinate convention shown</h2>
        <ul><li>0° points along +X.</li><li>Positive angles rotate counterclockwise.</li><li>+X is right; +Y is up.</li></ul>
      </div>
      <div class="reference-axis" role="img" aria-label="Coordinate axes: positive X right, positive Y up, positive angle counterclockwise">
        <span class="axis-x">+X</span><span class="axis-y">+Y</span><span class="axis-origin">0</span><span class="axis-angle">↺ +θ</span>
      </div>
    </section>

    <section class="reference-section" aria-labelledby="atan-title">
      <h2 id="atan-title"><code>atan</code> versus <code>atan2</code></h2>
      <div class="reference-grid two-up">
        <article class="caution-card"><strong>atan(Y ÷ X)</strong><p>Sees only the ratio. It can lose the original signs and return an ambiguous principal angle.</p><code>(10, 5) → 26.6°<br/>(−10, −5) → 26.6°</code></article>
        <article class="recommended-card"><strong>atan2(Y, X)</strong><p>Receives both signed components and locates the direction on the displayed axes.</p><code>(10, 5) → 26.6°<br/>(−10, −5) → 206.6°</code></article>
      </div>
    </section>

    <section class="reference-section" aria-labelledby="edge-title">
      <h2 id="edge-title">Edge cases and sign check</h2>
      <div class="reference-grid two-up">
        <article><strong>Before calculating</strong><ol><li>Identify the source X and Y axes.</li><li>Confirm which directions are positive.</li><li>Predict the quadrant from the signs.</li><li>Document the angle convention with the result.</li></ol></article>
        <article><strong>Undefined cases</strong><ul><li><b>X = 0:</b> tangent is undefined, but atan2 may still give direction.</li><li><b>X = 0 and Y = 0:</b> magnitude is zero and direction is undefined.</li><li><b>Inverse trig:</b> returns principal ranges, not every possible quadrant.</li><li><b>Programming:</b> trig functions may return radians rather than degrees.</li></ul></article>
      </div>
    </section>

    <section class="reference-section forensic-warning" aria-labelledby="warning-title">
      <h2 id="warning-title">Convention warning</h2>
      <p><strong>Do not silently treat this mathematical angle as PDOF, force direction, damage direction, or vehicle heading.</strong> EDR systems, standards, manufacturers, and agencies may use different axes and reporting conventions. Follow validated tools and the relevant documentation.</p>
      <a href="https://www.govinfo.gov/link/cfr/49/563?link-type=pdf&sectionnum=5&year=mostrecent" target="_blank" rel="noreferrer">49 CFR §563.5 EDR definitions ↗</a>
    </section>

    <section class="reference-section glossary" aria-labelledby="glossary-title">
      <h2 id="glossary-title">Glossary</h2>
      <dl>${GLOSSARY.map(([term, definition]) => `<div><dt>${term}</dt><dd>${definition}</dd></div>`).join("")}</dl>
    </section>

    <footer class="reference-footer">TrigLab is an intuition-building educational aid, not validated forensic software.</footer>
  </section>
`;
