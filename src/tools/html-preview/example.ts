export const EXAMPLE_HTML = `<h1>Hello, world!</h1>
<p>Edit the HTML, CSS, or JS and the preview updates live.</p>
<button id="btn">Clicked <span id="count">0</span> times</button>
`;

export const EXAMPLE_CSS = `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  margin: 2rem;
}
h1 {
  color: #7c3aed;
}
button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #d0d7de;
  cursor: pointer;
}
`;

export const EXAMPLE_JS = `document.getElementById("btn").addEventListener("click", () => {
  const el = document.getElementById("count");
  el.textContent = Number(el.textContent) + 1;
});
`;
