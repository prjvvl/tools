import{s as e,t}from"./react.Du4I-rQQ.js";import{n,r,t as i}from"./styles.BSfhQuN5.js";import{t as a}from"./jsx-runtime.691VFFbI.js";import{t as o}from"./createLucideIcon.B-MV5xGO.js";import{a as s,i as c,n as l,o as u,r as d,s as f,t as p}from"./x.CiPW0uf-.js";import{t as m}from"./marked.esm.CHDiQuH_.js";import{t as h}from"./purify.es.Cx-3ymZN.js";import{t as g}from"./mermaid.core.Qfts7Y1l.js";import{n as _,t as v}from"./theme.B4HEGa5a.js";var y={name:`code-xml`,size:24,node:[[`path`,{d:`m18 16 4-4-4-4`,key:`1inbqp`}],[`path`,{d:`m6 8-4 4 4 4`,key:`15zrgr`}],[`path`,{d:`m14.5 4-5 16`,key:`e7oirm`}]],aliases:[`code-2`]};y.node;var b=o(y),x=e(t(),1),S=`mermaid rounded-card border border-border bg-bg px-3 py-2 font-mono text-xs whitespace-pre-wrap text-fg-muted`,C=[];m.use({renderer:{code({text:e,lang:t}){return t===`mermaid`&&(C.push(e),`<div class="${S}"></div>`)}}});function w(e){C=[];let t=m.parse(e,{async:!1});return{html:h.sanitize(t),diagrams:C}}var T=`# Project Name

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
`,E=a(),D=200;function O(e){return`<!doctype html>
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
`}function k(){let[e,t]=(0,x.useState)(``),[a,o]=(0,x.useState)(``),[m,h]=(0,x.useState)(`editor`),[y,S]=(0,x.useState)(`dark`),[C,k]=(0,x.useState)(`idle`),A=(0,x.useRef)(null),j=(0,x.useRef)(null),M=(0,x.useRef)(0);(0,x.useEffect)(()=>(S(v()),_(S)),[]),(0,x.useEffect)(()=>{let t=setTimeout(()=>o(e),D);return()=>clearTimeout(t)},[e]);let{html:N,diagrams:P}=(0,x.useMemo)(()=>a.trim()?w(a):{html:``,diagrams:[]},[a]);(0,x.useEffect)(()=>{let e=A.current;if(!e)return;let t=Array.from(e.querySelectorAll(`.mermaid`)).map((e,t)=>({node:e,code:P[t]})).filter(({node:e})=>e.dataset.renderedTheme!==y);if(t.length===0)return;g.initialize({startOnLoad:!1,securityLevel:`strict`,theme:y===`dark`?`dark`:`default`});let r=!1;return(async()=>{for(let{node:e,code:i}of t){if(e.offsetParent===null||i===void 0)continue;let t=`md-preview-mermaid-${M.current++}`;try{let{svg:n}=await g.render(t,i);r||(e.className=`mermaid`,e.innerHTML=n,e.dataset.renderedTheme=y)}catch(t){if(!r){let r=t instanceof Error?t.message:`Could not render this diagram.`;e.innerHTML=``,e.className=n,e.setAttribute(`role`,`alert`),e.textContent=`Invalid Mermaid diagram: ${r}`,e.dataset.renderedTheme=y}}}})(),()=>{r=!0}},[N,P,y,m]);function F(e){let n=new FileReader;n.onload=()=>t(String(n.result??``)),n.readAsText(e)}async function I(){if(A.current){try{await navigator.clipboard.writeText(A.current.innerHTML),k(`copied`)}catch{k(`failed`)}setTimeout(()=>k(`idle`),1500)}}function L(){if(!A.current)return;let e=new Blob([O(A.current.innerHTML)],{type:`text/html;charset=utf-8`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`preview.html`,n.click(),URL.revokeObjectURL(t)}let R=e=>`${m===e?`block`:`hidden`} lg:block`;return(0,E.jsxs)(`div`,{className:`mx-auto max-w-6xl`,children:[(0,E.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-3`,children:[(0,E.jsxs)(`button`,{type:`button`,onClick:()=>t(T),className:i.secondary,children:[(0,E.jsx)(f,{className:`size-4`,"aria-hidden":`true`}),`Load Example`]}),(0,E.jsxs)(`button`,{type:`button`,onClick:()=>j.current?.click(),className:i.secondary,children:[(0,E.jsx)(l,{className:`size-4`,"aria-hidden":`true`}),`Open File`]}),(0,E.jsx)(`input`,{ref:j,type:`file`,accept:`.md,.markdown,.txt`,className:`hidden`,onChange:e=>{let t=e.target.files?.[0];t&&F(t),e.target.value=``}}),(0,E.jsx)(`div`,{className:`flex-1`}),(0,E.jsxs)(`button`,{type:`button`,onClick:I,className:i.secondary,children:[C===`copied`?(0,E.jsx)(u,{className:`size-4`,"aria-hidden":`true`}):C===`failed`?(0,E.jsx)(p,{className:`size-4`,"aria-hidden":`true`}):(0,E.jsx)(s,{className:`size-4`,"aria-hidden":`true`}),C===`copied`?`Copied!`:C===`failed`?`Copy failed`:`Copy HTML`]}),(0,E.jsxs)(`button`,{type:`button`,onClick:L,className:i.primary,children:[(0,E.jsx)(c,{className:`size-4`,"aria-hidden":`true`}),`Download HTML`]})]}),(0,E.jsxs)(`div`,{className:`mt-4 flex gap-2 lg:hidden`,children:[(0,E.jsxs)(`button`,{type:`button`,onClick:()=>h(`editor`),className:r(m===`editor`),children:[(0,E.jsx)(b,{className:`size-4`,"aria-hidden":`true`}),`Editor`]}),(0,E.jsxs)(`button`,{type:`button`,onClick:()=>h(`preview`),className:r(m===`preview`),children:[(0,E.jsx)(d,{className:`size-4`,"aria-hidden":`true`}),`Preview`]})]}),(0,E.jsxs)(`div`,{className:`mt-4 grid gap-6 lg:grid-cols-2`,children:[(0,E.jsxs)(`div`,{className:R(`editor`),children:[(0,E.jsx)(`label`,{htmlFor:`md-source`,className:`block text-sm font-medium text-fg`,children:`Markdown source`}),(0,E.jsx)(`textarea`,{id:`md-source`,value:e,onChange:e=>t(e.target.value),onDragOver:e=>e.preventDefault(),onDrop:e=>{e.preventDefault();let t=e.dataTransfer.files?.[0];t&&F(t)},placeholder:`Paste or drop a .md file, or type Markdown here...`,spellCheck:!1,className:`mt-2 h-[70vh] w-full resize-none rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none`})]}),(0,E.jsxs)(`div`,{className:R(`preview`),children:[(0,E.jsx)(`p`,{className:`text-sm font-medium text-fg`,children:`Preview`}),(0,E.jsx)(`div`,{className:`mt-2 h-[70vh] overflow-y-auto rounded-card border border-border bg-surface p-4`,children:(0,E.jsx)(`div`,{ref:A,className:`prose max-w-none`,dangerouslySetInnerHTML:{__html:N}})})]})]})]})}export{k as default};