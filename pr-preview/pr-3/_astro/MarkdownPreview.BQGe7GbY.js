import{s as e,t}from"./react.Du4I-rQQ.js";import{n,r,t as i}from"./styles.BSfhQuN5.js";import{t as a}from"./jsx-runtime.691VFFbI.js";import{t as o}from"./createLucideIcon.B-MV5xGO.js";import{t as s}from"./marked.esm.CHDiQuH_.js";import{t as c}from"./purify.es.Cx-3ymZN.js";import{t as l}from"./mermaid.core.Qfts7Y1l.js";import{n as u,t as d}from"./theme.B4HEGa5a.js";var f={name:`book-open`,size:24,node:[[`path`,{d:`M12 5v16`,key:`1f6ucr`}],[`path`,{d:`M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z`,key:`1fyvmf`}]]};f.node;var p=o(f),m={name:`check`,size:24,node:[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]};m.node;var h=o(m),g={name:`code-xml`,size:24,node:[[`path`,{d:`m18 16 4-4-4-4`,key:`1inbqp`}],[`path`,{d:`m6 8-4 4 4 4`,key:`15zrgr`}],[`path`,{d:`m14.5 4-5 16`,key:`e7oirm`}]],aliases:[`code-2`]};g.node;var _=o(g),v={name:`copy`,size:24,node:[[`rect`,{width:`14`,height:`14`,x:`8`,y:`8`,rx:`2`,ry:`2`,key:`17jyea`}],[`path`,{d:`M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`,key:`zix9uf`}]]};v.node;var y=o(v),b={name:`download`,size:24,node:[[`path`,{d:`M12 15V3`,key:`m9g1x1`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}],[`path`,{d:`m7 10 5 5 5-5`,key:`brsn70`}]]};b.node;var x=o(b),S={name:`eye`,size:24,node:[[`path`,{d:`M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0`,key:`1nclc0`}],[`circle`,{cx:`12`,cy:`12`,r:`3`,key:`1v7zrd`}]]};S.node;var C=o(S),w={name:`folder-open`,size:24,node:[[`path`,{d:`m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2`,key:`usdka0`}]]};w.node;var T=o(w),E={name:`x`,size:24,node:[[`path`,{d:`M18 6 6 18`,key:`1bl5f8`}],[`path`,{d:`m6 6 12 12`,key:`d8bk6v`}]]};E.node;var D=o(E),O=e(t(),1),k=`mermaid rounded-card border border-border bg-bg px-3 py-2 font-mono text-xs whitespace-pre-wrap text-fg-muted`,A=[];s.use({renderer:{code({text:e,lang:t}){return t===`mermaid`&&(A.push(e),`<div class="${k}"></div>`)}}});function j(e){A=[];let t=s.parse(e,{async:!1});return{html:c.sanitize(t),diagrams:A}}var M=`# Project Name

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
`,N=a(),P=200;function F(e){return`<!doctype html>
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
`}function I(){let[e,t]=(0,O.useState)(``),[a,o]=(0,O.useState)(``),[s,c]=(0,O.useState)(`editor`),[f,m]=(0,O.useState)(`dark`),[g,v]=(0,O.useState)(`idle`),b=(0,O.useRef)(null),S=(0,O.useRef)(null),w=(0,O.useRef)(0);(0,O.useEffect)(()=>(m(d()),u(m)),[]),(0,O.useEffect)(()=>{let t=setTimeout(()=>o(e),P);return()=>clearTimeout(t)},[e]);let{html:E,diagrams:k}=(0,O.useMemo)(()=>a.trim()?j(a):{html:``,diagrams:[]},[a]);(0,O.useEffect)(()=>{let e=b.current;if(!e)return;let t=Array.from(e.querySelectorAll(`.mermaid`)).map((e,t)=>({node:e,code:k[t]})).filter(({node:e})=>e.dataset.renderedTheme!==f);if(t.length===0)return;l.initialize({startOnLoad:!1,securityLevel:`strict`,theme:f===`dark`?`dark`:`default`});let r=!1;return(async()=>{for(let{node:e,code:i}of t){if(e.offsetParent===null||i===void 0)continue;let t=`md-preview-mermaid-${w.current++}`;try{let{svg:n}=await l.render(t,i);r||(e.className=`mermaid`,e.innerHTML=n,e.dataset.renderedTheme=f)}catch(t){if(!r){let r=t instanceof Error?t.message:`Could not render this diagram.`;e.innerHTML=``,e.className=n,e.setAttribute(`role`,`alert`),e.textContent=`Invalid Mermaid diagram: ${r}`,e.dataset.renderedTheme=f}}}})(),()=>{r=!0}},[E,k,f,s]);function A(e){let n=new FileReader;n.onload=()=>t(String(n.result??``)),n.readAsText(e)}async function I(){if(b.current){try{await navigator.clipboard.writeText(b.current.innerHTML),v(`copied`)}catch{v(`failed`)}setTimeout(()=>v(`idle`),1500)}}function L(){if(!b.current)return;let e=new Blob([F(b.current.innerHTML)],{type:`text/html;charset=utf-8`}),t=URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`preview.html`,n.click(),URL.revokeObjectURL(t)}let R=e=>`${s===e?`block`:`hidden`} lg:block`;return(0,N.jsxs)(`div`,{className:`mx-auto max-w-6xl`,children:[(0,N.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-3`,children:[(0,N.jsxs)(`button`,{type:`button`,onClick:()=>t(M),className:i.secondary,children:[(0,N.jsx)(p,{className:`size-4`,"aria-hidden":`true`}),`Load Example`]}),(0,N.jsxs)(`button`,{type:`button`,onClick:()=>S.current?.click(),className:i.secondary,children:[(0,N.jsx)(T,{className:`size-4`,"aria-hidden":`true`}),`Open File`]}),(0,N.jsx)(`input`,{ref:S,type:`file`,accept:`.md,.markdown,.txt`,className:`hidden`,onChange:e=>{let t=e.target.files?.[0];t&&A(t),e.target.value=``}}),(0,N.jsx)(`div`,{className:`flex-1`}),(0,N.jsxs)(`button`,{type:`button`,onClick:I,className:i.secondary,children:[g===`copied`?(0,N.jsx)(h,{className:`size-4`,"aria-hidden":`true`}):g===`failed`?(0,N.jsx)(D,{className:`size-4`,"aria-hidden":`true`}):(0,N.jsx)(y,{className:`size-4`,"aria-hidden":`true`}),g===`copied`?`Copied!`:g===`failed`?`Copy failed`:`Copy HTML`]}),(0,N.jsxs)(`button`,{type:`button`,onClick:L,className:i.primary,children:[(0,N.jsx)(x,{className:`size-4`,"aria-hidden":`true`}),`Download HTML`]})]}),(0,N.jsxs)(`div`,{className:`mt-4 flex gap-2 lg:hidden`,children:[(0,N.jsxs)(`button`,{type:`button`,onClick:()=>c(`editor`),className:r(s===`editor`),children:[(0,N.jsx)(_,{className:`size-4`,"aria-hidden":`true`}),`Editor`]}),(0,N.jsxs)(`button`,{type:`button`,onClick:()=>c(`preview`),className:r(s===`preview`),children:[(0,N.jsx)(C,{className:`size-4`,"aria-hidden":`true`}),`Preview`]})]}),(0,N.jsxs)(`div`,{className:`mt-4 grid gap-6 lg:grid-cols-2`,children:[(0,N.jsxs)(`div`,{className:R(`editor`),children:[(0,N.jsx)(`label`,{htmlFor:`md-source`,className:`block text-sm font-medium text-fg`,children:`Markdown source`}),(0,N.jsx)(`textarea`,{id:`md-source`,value:e,onChange:e=>t(e.target.value),onDragOver:e=>e.preventDefault(),onDrop:e=>{e.preventDefault();let t=e.dataTransfer.files?.[0];t&&A(t)},placeholder:`Paste or drop a .md file, or type Markdown here...`,spellCheck:!1,className:`mt-2 h-[70vh] w-full resize-none rounded-card border border-border bg-bg p-3 font-mono text-sm text-fg placeholder:text-fg-muted focus:border-brand-300 focus:outline-none`})]}),(0,N.jsxs)(`div`,{className:R(`preview`),children:[(0,N.jsx)(`p`,{className:`text-sm font-medium text-fg`,children:`Preview`}),(0,N.jsx)(`div`,{className:`mt-2 h-[70vh] overflow-y-auto rounded-card border border-border bg-surface p-4`,children:(0,N.jsx)(`div`,{ref:b,className:`prose max-w-none`,dangerouslySetInnerHTML:{__html:E}})})]})]})]})}export{I as default};