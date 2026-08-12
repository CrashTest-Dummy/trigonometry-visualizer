import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Application root was not found.");
}

app.innerHTML = `
  <main class="setup-shell">
    <p class="eyebrow">TrigLab</p>
    <h1>Interactive trigonometry, built to be seen.</h1>
    <p>The first visual lesson is being assembled here.</p>
  </main>
`;

