export const EXAMPLE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Example</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; margin: 2rem; }
  h1 { color: #7c3aed; }
  button { padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #d0d7de; cursor: pointer; }
</style>
</head>
<body>
  <h1>Hello, world!</h1>
  <p>Edit the HTML on the left and the preview updates live.</p>
  <button onclick="document.getElementById('count').textContent = Number(document.getElementById('count').textContent) + 1">
    Clicked <span id="count">0</span> times
  </button>
</body>
</html>
`;
