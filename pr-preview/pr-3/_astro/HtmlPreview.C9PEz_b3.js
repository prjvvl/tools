import{s as e,t}from"./react.Du4I-rQQ.js";import{r as n,t as r}from"./styles.BSfhQuN5.js";import{t as i}from"./jsx-runtime.691VFFbI.js";import{a,i as o,n as s,o as c,r as l,s as u,t as d}from"./x.CiPW0uf-.js";var f=e(t(),1),p=`<h1>Hello, world!</h1>
<p>Edit the HTML, CSS, or JS and the preview updates live.</p>
<button id="btn">Clicked <span id="count">0</span> times</button>
`,m=`body {
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
`,h=`document.getElementById("btn").addEventListener("click", () => {
  const el = document.getElementById("count");
  el.textContent = Number(el.textContent) + 1;
});
`,g=i(),_=200,v=[{id:`html`,label:`HTML`,accept:`.html,.htm,.txt`,placeholder:`<h1>Hello, world!</h1>`},{id:`css`,label:`CSS`,accept:`.css,.txt`,placeholder:`h1 { color: #7c3aed; }`},{id:`js`,label:`JS`,accept:`.js,.txt`,placeholder:`console.log('Hello!');`}];function y(e,t,n){return`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
${t}
</style>
</head>
<body>
${e}
<script>
${n}
<\/script>
</body>
</html>
`}function b(){let[e,t]=(0,f.useState)(`html`),[i,b]=(0,f.useState)(``),[x,S]=(0,f.useState)(``),[C,w]=(0,f.useState)(``),[T,E]=(0,f.useState)({html:``,css:``,js:``}),[D,O]=(0,f.useState)(`editor`),[k,A]=(0,f.useState)(`idle`),j=(0,f.useRef)(null);(0,f.useEffect)(()=>{let e=setTimeout(()=>E({html:i,css:x,js:C}),_);return()=>clearTimeout(e)},[i,x,C]);let[M,N]={html:[i,b],css:[x,S],js:[C,w]}[e],P=v.find(t=>t.id===e);function F(){b(p),S(m),w(h)}function I(e){let t=new FileReader;t.onload=()=>N(String(t.result??``)),t.readAsText(e)}async function L(){if(M){try{await navigator.clipboard.writeText(M),A(`copied`)}catch{A(`failed`)}setTimeout(()=>A(`idle`),1500)}}function R(){let e=new Blob([y(i,x,C)],{type:`text/html;charset=utf-8`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`preview.html`,n.click(),URL.revokeObjectURL(t)}let z=e=>`${D===e?`block`:`hidden`} lg:block`;return(0,g.jsxs)(`div`,{className:`mx-auto max-w-6xl`,children:[(0,g.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-3`,children:[(0,g.jsxs)(`button`,{type:`button`,onClick:F,className:r.secondary,children:[(0,g.jsx)(u,{className:`size-4`,"aria-hidden":`true`}),`Load Example`]}),(0,g.jsxs)(`button`,{type:`button`,onClick:()=>j.current?.click(),className:r.secondary,children:[(0,g.jsx)(s,{className:`size-4`,"aria-hidden":`true`}),`Open File into `,P.label]}),(0,g.jsx)(`input`,{ref:j,type:`file`,accept:P.accept,className:`hidden`,onChange:e=>{let t=e.target.files?.[0];t&&I(t),e.target.value=``}}),(0,g.jsx)(`div`,{className:`flex-1`}),(0,g.jsxs)(`button`,{type:`button`,onClick:L,className:r.secondary,children:[k===`copied`?(0,g.jsx)(c,{className:`size-4`,"aria-hidden":`true`}):k===`failed`?(0,g.jsx)(d,{className:`size-4`,"aria-hidden":`true`}):(0,g.jsx)(a,{className:`size-4`,"aria-hidden":`true`}),k===`copied`?`Copied!`:k===`failed`?`Copy failed`:`Copy ${P.label}`]}),(0,g.jsxs)(`button`,{type:`button`,onClick:R,className:r.primary,children:[(0,g.jsx)(o,{className:`size-4`,"aria-hidden":`true`}),`Download HTML`]})]}),(0,g.jsxs)(`div`,{className:`mt-4 flex flex-wrap items-center gap-3`,children:[(0,g.jsx)(`div`,{className:`flex gap-2`,role:`tablist`,"aria-label":`Source`,children:v.map(r=>(0,g.jsx)(`button`,{type:`button`,role:`tab`,"aria-selected":e===r.id,onClick:()=>{t(r.id),O(`editor`)},className:n(e===r.id),children:r.label},r.id))}),(0,g.jsxs)(`button`,{type:`button`,onClick:()=>O(`preview`),className:`${n(D===`preview`)} lg:hidden`,children:[(0,g.jsx)(l,{className:`size-4`,"aria-hidden":`true`}),`Preview`]})]}),(0,g.jsxs)(`div`,{className:`mt-4 grid gap-6 lg:grid-cols-2`,children:[(0,g.jsxs)(`div`,{className:z(`editor`),children:[(0,g.jsxs)(`label`,{htmlFor:`source-editor`,className:`block text-sm font-medium text-fg`,children:[P.label,` source`]}),(0,g.jsx)(`textarea`,{id:`source-editor`,value:M,onChange:e=>N(e.target.value),onDragOver:e=>e.preventDefault(),onDrop:e=>{e.preventDefault();let t=e.dataTransfer.files?.[0];t&&I(t)},placeholder:`Paste or drop a file, or type ${P.label} here...\ne.g. ${P.placeholder}`,spellCheck:!1,className:`mt-2 h-[65vh] w-full resize-none rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none`})]}),(0,g.jsxs)(`div`,{className:z(`preview`),children:[(0,g.jsxs)(`p`,{className:`text-sm font-medium text-fg`,children:[`Preview`,` `,(0,g.jsx)(`span`,{className:`font-normal text-fg-muted`,children:`— runs in a sandboxed frame, isolated from this page`})]}),(0,g.jsx)(`div`,{className:`mt-2 h-[70vh] overflow-hidden rounded-card border border-border bg-white`,children:(0,g.jsx)(`iframe`,{title:`HTML preview`,srcDoc:y(T.html,T.css,T.js),sandbox:`allow-scripts`,className:`h-full w-full`})})]})]})]})}export{b as default};