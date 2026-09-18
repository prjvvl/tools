import{s as e,t}from"./react.Du4I-rQQ.js";import{n,r,t as i}from"./styles.BSfhQuN5.js";import{t as a}from"./jsx-runtime.691VFFbI.js";import{a as o,c as s,i as c,n as l,o as u,r as d,s as f,t as p}from"./x.CzWrmykx.js";import{t as m}from"./marked.esm.CHDiQuH_.js";import{t as h}from"./purify.es.Cx-3ymZN.js";import{t as g}from"./mermaid.core.Qfts7Y1l.js";import{n as _,t as v}from"./theme.B4HEGa5a.js";var y=e(t(),1),b=`mermaid rounded-card border border-border bg-bg px-3 py-2 font-mono text-xs whitespace-pre-wrap text-fg-muted`,x=[];m.use({renderer:{code({text:e,lang:t}){return t===`mermaid`&&(x.push(e),`<div class="${b}"></div>`)}}});function S(e){x=[];let t=m.parse(e,{async:!1});return{html:h.sanitize(t),diagrams:x}}var C=`# Project Name

A short description of what this project does and who it's for.

## Features

- [x] GitHub-flavored tables
- [x] Task lists
- [ ] Something still in progress

| Feature  | Supported |
| -------- | :-------: |
| Tables   |    ✅     |
| Mermaid  |    ✅     |
| Raw HTML |    🚫     |

## How it works

\`\`\`mermaid
flowchart TD
    A[Write Markdown] --> B{Contains a diagram?}
    B -- Yes --> C[Render with Mermaid]
    B -- No --> D[Render as HTML]
    C --> E[Preview]
    D --> E[Preview]
\`\`\`

> Edit the text on the left and watch this preview update.
`,w=a(),T=200;function E(e){return`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Markdown Preview</title>
<style>
  body { max-width: 860px; margin: 2rem auto; padding: 0 1.5rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2328; }
  pre { background: #f6f8fa; padding: 1rem; overflow-x: auto; border-radius: 6px; }
  code { background: #f6f8fa; padding: 0.15em 0.35em; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #d0d7de; padding: 0.5rem 0.75rem; }
  blockquote { margin: 0; padding-left: 1rem; border-left: 4px solid #d0d7de; color: #59636e; }
  img { max-width: 100%; }
</style>
</head>
<body>
${e}
</body>
</html>
`}function D(){let[e,t]=(0,y.useState)(``),[a,m]=(0,y.useState)(``),[h,b]=(0,y.useState)(`editor`),[x,D]=(0,y.useState)(`dark`),[O,k]=(0,y.useState)(`idle`),A=(0,y.useRef)(null),j=(0,y.useRef)(null),M=(0,y.useRef)(0);(0,y.useEffect)(()=>(D(v()),_(D)),[]),(0,y.useEffect)(()=>{let t=setTimeout(()=>m(e),T);return()=>clearTimeout(t)},[e]);let{html:N,diagrams:P}=(0,y.useMemo)(()=>a.trim()?S(a):{html:``,diagrams:[]},[a]);(0,y.useEffect)(()=>{let e=A.current;if(!e)return;let t=Array.from(e.querySelectorAll(`.mermaid`)).map((e,t)=>({node:e,code:P[t]})).filter(({node:e})=>e.dataset.renderedTheme!==x);if(t.length===0)return;g.initialize({startOnLoad:!1,securityLevel:`strict`,theme:x===`dark`?`dark`:`default`});let r=!1;return(async()=>{for(let{node:e,code:i}of t){if(e.offsetParent===null||i===void 0)continue;let t=`md-preview-mermaid-${M.current++}`;try{let{svg:n}=await g.render(t,i);r||(e.className=`mermaid`,e.innerHTML=n,e.dataset.renderedTheme=x)}catch(t){if(!r){let r=t instanceof Error?t.message:`Could not render this diagram.`;e.innerHTML=``,e.className=n,e.setAttribute(`role`,`alert`),e.textContent=`Invalid Mermaid diagram: ${r}`,e.dataset.renderedTheme=x}}}})(),()=>{r=!0}},[N,P,x,h]);function F(e){let n=new FileReader;n.onload=()=>t(String(n.result??``)),n.readAsText(e)}async function I(){if(A.current){try{await navigator.clipboard.writeText(A.current.innerHTML),k(`copied`)}catch{k(`failed`)}setTimeout(()=>k(`idle`),1500)}}function L(){if(!A.current)return;let e=new Blob([E(A.current.innerHTML)],{type:`text/html;charset=utf-8`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`preview.html`,n.click(),URL.revokeObjectURL(t)}let R=e=>`${h===e?`block`:`hidden`} lg:block`;return(0,w.jsxs)(`div`,{className:`mx-auto max-w-6xl`,children:[(0,w.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-3`,children:[(0,w.jsxs)(`button`,{type:`button`,onClick:()=>t(C),className:i.secondary,children:[(0,w.jsx)(s,{className:`size-4`,"aria-hidden":`true`}),`Load Example`]}),(0,w.jsxs)(`button`,{type:`button`,onClick:()=>j.current?.click(),className:i.secondary,children:[(0,w.jsx)(l,{className:`size-4`,"aria-hidden":`true`}),`Open File`]}),(0,w.jsx)(`input`,{ref:j,type:`file`,accept:`.md,.markdown,.txt`,className:`hidden`,onChange:e=>{let t=e.target.files?.[0];t&&F(t),e.target.value=``}}),(0,w.jsx)(`div`,{className:`flex-1`}),(0,w.jsxs)(`button`,{type:`button`,onClick:I,className:i.secondary,children:[O===`copied`?(0,w.jsx)(f,{className:`size-4`,"aria-hidden":`true`}):O===`failed`?(0,w.jsx)(p,{className:`size-4`,"aria-hidden":`true`}):(0,w.jsx)(o,{className:`size-4`,"aria-hidden":`true`}),O===`copied`?`Copied!`:O===`failed`?`Copy failed`:`Copy HTML`]}),(0,w.jsxs)(`button`,{type:`button`,onClick:L,className:i.primary,children:[(0,w.jsx)(c,{className:`size-4`,"aria-hidden":`true`}),`Download HTML`]})]}),(0,w.jsxs)(`div`,{className:`mt-4 flex gap-2 lg:hidden`,children:[(0,w.jsxs)(`button`,{type:`button`,onClick:()=>b(`editor`),className:r(h===`editor`),children:[(0,w.jsx)(u,{className:`size-4`,"aria-hidden":`true`}),`Editor`]}),(0,w.jsxs)(`button`,{type:`button`,onClick:()=>b(`preview`),className:r(h===`preview`),children:[(0,w.jsx)(d,{className:`size-4`,"aria-hidden":`true`}),`Preview`]})]}),(0,w.jsxs)(`div`,{className:`mt-4 grid gap-6 lg:grid-cols-2`,children:[(0,w.jsxs)(`div`,{className:R(`editor`),children:[(0,w.jsx)(`label`,{htmlFor:`md-source`,className:`block text-sm font-medium text-fg`,children:`Markdown source`}),(0,w.jsx)(`textarea`,{id:`md-source`,value:e,onChange:e=>t(e.target.value),onDragOver:e=>e.preventDefault(),onDrop:e=>{e.preventDefault();let t=e.dataTransfer.files?.[0];t&&F(t)},placeholder:`Paste or drop a .md file, or type Markdown here...`,spellCheck:!1,className:`mt-2 h-[70vh] w-full resize-none rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none`})]}),(0,w.jsxs)(`div`,{className:R(`preview`),children:[(0,w.jsx)(`p`,{className:`text-sm font-medium text-fg`,children:`Preview`}),(0,w.jsx)(`div`,{className:`mt-2 h-[70vh] overflow-y-auto rounded-card border border-border bg-surface p-4`,children:(0,w.jsx)(`div`,{ref:A,className:`prose max-w-none`,dangerouslySetInnerHTML:{__html:N}})})]})]})]})}export{D as default};