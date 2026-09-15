import{c as e,o as t}from"./bundle.B9kOaYsn.js";import{m as n}from"./dist.BxgmiMzM.js";import{t as r}from"./arc.B72gPkKk.js";import{i,p as a}from"./chunk-75Z2AOVW.CPAKg87b.js";import{n as o}from"./chunk-Y2CYZVJY.DsF7k-Jl.js";import{m as s}from"./src.DEUvw-hz.js";import{H as c,K as l,U as u,a as d,c as f,f as p,v as m,w as h,x as g,y as _}from"./chunk-DU6HZSFF.BkUP_ixV.js";import{t as v}from"./ordinal.BAxfPAgN.js";import{p as y}from"./mermaid.core.D9LId01b.js";import{n as b}from"./mermaid-parser.core.Dn1oAHWS.js";import{t as x}from"./chunk-JWPE2WC7.A3RzWITa.js";function S(e,t){return t<e?-1:t>e?1:t>=e?0:NaN}function C(e){return e}function w(){var r=C,i=S,a=null,o=e(0),s=e(n),c=e(0);function l(e){var l,u=(e=t(e)).length,d,f,p=0,m=Array(u),h=Array(u),g=+o.apply(this,arguments),_=Math.min(n,Math.max(-n,s.apply(this,arguments)-g)),v,y=Math.min(Math.abs(_)/u,c.apply(this,arguments)),b=y*(_<0?-1:1),x;for(l=0;l<u;++l)(x=h[m[l]=l]=+r(e[l],l,e))>0&&(p+=x);for(i==null?a!=null&&m.sort(function(t,n){return a(e[t],e[n])}):m.sort(function(e,t){return i(h[e],h[t])}),l=0,f=p?(_-u*b)/p:0;l<u;++l,g=v)d=m[l],x=h[d],v=g+(x>0?x*f:0)+b,h[d]={data:e[d],index:l,value:x,startAngle:g,endAngle:v,padAngle:y};return h}return l.value=function(t){return arguments.length?(r=typeof t==`function`?t:e(+t),l):r},l.sortValues=function(e){return arguments.length?(i=e,a=null,l):i},l.sort=function(e){return arguments.length?(a=e,i=null,l):a},l.startAngle=function(t){return arguments.length?(o=typeof t==`function`?t:e(+t),l):o},l.endAngle=function(t){return arguments.length?(s=typeof t==`function`?t:e(+t),l):s},l.padAngle=function(t){return arguments.length?(c=typeof t==`function`?t:e(+t),l):c},l}var T=p.pie,E={sections:new Map,showData:!1,config:T},D=E.sections,O=E.showData,k=structuredClone(T),A={getConfig:o(()=>structuredClone(k),`getConfig`),clear:o(()=>{D=new Map,O=E.showData,d()},`clear`),setDiagramTitle:l,getDiagramTitle:h,setAccTitle:u,getAccTitle:_,setAccDescription:c,getAccDescription:m,addSection:o(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(e)||(D.set(e,t),s.debug(`added new section: ${e}, with value: ${t}`))},`addSection`),getSections:o(()=>D,`getSections`),setShowData:o(e=>{O=e},`setShowData`),getShowData:o(()=>O,`getShowData`)},j=o((e,t)=>{x(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},`populateDb`),M={parse:o(async e=>{let t=await b(`pie`,e);s.debug(t),j(t,A)},`parse`)},N=o(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,`getStyles`),P=o(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),n=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return w().value(e=>e.value).sort(null)(n)},`createPieArcs`),F={parser:M,db:A,renderer:{draw:o((e,t,n,o)=>{s.debug(`rendering pie chart
`+e);let c=o.db,l=g(),u=i(c.getConfig(),l.pie),d=y(t),p=d.append(`g`);p.attr(`transform`,`translate(225,225)`);let{themeVariables:m}=l,[h]=a(m.pieOuterStrokeWidth);h??=2;let _=u.legendPosition,b=u.textPosition,x=u.donutHole>0&&u.donutHole<=.9?u.donutHole:0,S=r().innerRadius(x*185).outerRadius(185),C=r().innerRadius(185*b).outerRadius(185*b),w=p.append(`g`);w.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,185+h/2).attr(`class`,`pieOuterCircle`);let T=c.getSections(),E=P(T),D=[m.pie1,m.pie2,m.pie3,m.pie4,m.pie5,m.pie6,m.pie7,m.pie8,m.pie9,m.pie10,m.pie11,m.pie12],O=0;T.forEach(e=>{O+=e});let k=E.filter(e=>(e.data.value/O*100).toFixed(0)!==`0`),A=v(D).domain([...T.keys()]);w.selectAll(`mySlices`).data(k).enter().append(`path`).attr(`d`,S).attr(`fill`,e=>A(e.data.label)).attr(`class`,e=>{let t=`pieCircle`;return u.highlightSlice===`hover`?t+=` highlightedOnHover`:u.highlightSlice===e.data.label&&(t+=` highlighted`),t}),w.selectAll(`mySlices`).data(k).enter().append(`text`).text(e=>(e.data.value/O*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+C.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`);let j=p.append(`text`).text(c.getDiagramTitle()).attr(`x`,0).attr(`y`,-200).attr(`class`,`pieTitleText`),M=[...T.entries()].map(([e,t])=>({label:e,value:t})),N=p.selectAll(`.legend`).data(M).enter().append(`g`).attr(`class`,`legend`);N.append(`rect`).attr(`width`,18).attr(`height`,18).style(`fill`,e=>A(e.label)).style(`stroke`,e=>A(e.label)),N.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>c.getShowData()?`${e.label} [${e.value}]`:e.label);let F=Math.max(...N.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0)),I=450,L=490,R=M.length*22;switch(_){case`center`:N.attr(`transform`,(e,t)=>{let n=22*M.length/2,r=-F/2-22,i=t*22-n;return`translate(`+r+`,`+i+`)`});break;case`top`:I+=R,N.attr(`transform`,(e,t)=>`translate(${-F/2-22}, ${t*22-185})`),w.attr(`transform`,()=>`translate(0, ${R+22})`);break;case`bottom`:I+=R,N.attr(`transform`,(e,t)=>{let n=-F/2-22,r=t*22- -207;return`translate(`+n+`,`+r+`)`});break;case`left`:L+=22+F,N.attr(`transform`,(e,t)=>{let n=22*M.length/2;return`translate(-207,`+(t*22-n)+`)`}),w.attr(`transform`,()=>`translate(${F+18+4}, 0)`);break;default:L+=22+F,N.attr(`transform`,(e,t)=>{let n=22*M.length/2;return`translate(216,`+(t*22-n)+`)`})}let z=j.node()?.getBoundingClientRect().width??0,B=225-z/2,V=225+z/2,H=Math.min(0,B),U=Math.max(L,V)-H;d.attr(`viewBox`,`${H} 0 ${U} ${I}`),f(d,I,U,u.useMaxWidth)},`draw`)},styles:N};export{F as diagram};